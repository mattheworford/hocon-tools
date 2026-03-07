import * as vscode from "vscode";
import hocon = require("hocon-parser");

export function activate(context: vscode.ExtensionContext) {
  const command = vscode.commands.registerCommand(
    "hocon-tools.previewAsJson",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return;
      }

      const text = editor.document.getText().replace(
        /\$\{\??([a-zA-Z_][a-zA-Z0-9_.\-]*)\}/g,
        (match, varName) => {
          const value = process.env[varName];
          if (value !== undefined) {
            return JSON.stringify(value);
          }
          return match;
        }
      );

      let parsed: unknown;
      try {
        parsed = hocon(text);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown parse error";
        vscode.window.showErrorMessage(`HOCON parse error: ${message}`);
        return;
      }

      const json = JSON.stringify(parsed, null, 2);
      const uri = vscode.Uri.parse(
        "hocon-preview:" +
          editor.document.fileName.replace(/\.[^.]+$/, "") +
          ".json"
      );

      const provider = new (class
        implements vscode.TextDocumentContentProvider
      {
        provideTextDocumentContent(): string {
          return json;
        }
      })();

      const registration =
        vscode.workspace.registerTextDocumentContentProvider(
          "hocon-preview",
          provider
        );

      const doc = await vscode.workspace.openTextDocument(uri);
      await vscode.languages.setTextDocumentLanguage(doc, "json");
      await vscode.window.showTextDocument(doc, {
        viewColumn: vscode.ViewColumn.Beside,
        preview: true,
        preserveFocus: true,
      });

      registration.dispose();
    }
  );

  const hoverProvider = vscode.languages.registerHoverProvider("hocon", {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(
        position,
        /\$\{(\??)([a-zA-Z_][a-zA-Z0-9_.\-]*)}/
      );
      if (!range) {
        return;
      }

      const match = document
        .getText(range)
        .match(/\$\{(\??)([a-zA-Z_][a-zA-Z0-9_.\-]*)}/);
      if (!match) {
        return;
      }

      const varName = match[2];
      const keyLocation = findKeyDefinition(document, varName);

      const markdown = new vscode.MarkdownString();

      if (keyLocation) {
        const defLine = document.lineAt(keyLocation.range.start.line);
        const valueMatch = defLine.text.match(/\s*[=:]\s*(.*)/);
        const value = valueMatch ? valueMatch[1].trim() : "";
        markdown.appendMarkdown(`**HOCON Key:** \`${varName}\`\n\n`);
        markdown.appendMarkdown(`**Value:** \`${value}\``);
      } else {
        const value = process.env[varName];
        markdown.appendMarkdown(
          `**Environment Variable:** \`${varName}\`\n\n`
        );
        markdown.appendMarkdown(
          `**Current Value:** \`${value !== undefined ? value : "undefined"}\``
        );
      }

      return new vscode.Hover(markdown, range);
    },
  });

  const definitionProvider = vscode.languages.registerDefinitionProvider(
    "hocon",
    {
      provideDefinition(document, position) {
        const range = document.getWordRangeAtPosition(
          position,
          /\$\{\??([a-zA-Z_][a-zA-Z0-9_.\-]*)\}/
        );
        if (!range) {
          return;
        }

        const match = document
          .getText(range)
          .match(/\$\{\??([a-zA-Z_][a-zA-Z0-9_.\-]*)\}/);
        if (!match) {
          return;
        }

        const targetKey = match[1];
        const location = findKeyDefinition(document, targetKey);
        return location ?? undefined;
      },
    }
  );

  context.subscriptions.push(command, hoverProvider, definitionProvider);
}

function findKeyDefinition(
  document: vscode.TextDocument,
  targetKey: string
): vscode.Location | null {
  // Match key assignments: key = value, key : value, key { ... }
  // Keys can be unquoted, quoted, or dot-separated
  const keyPattern =
    /^(\s*)(?:(?:"([^"]+)"|([a-zA-Z_][a-zA-Z0-9_\-]*))(\s*[.]\s*(?:"[^"]+"|[a-zA-Z_][a-zA-Z0-9_\-]*))*)\s*[=:{]/;

  let currentPrefix = "";
  let braceDepth = 0;
  let expectedDepth = 0;

  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    const text = line.text;

    // Track brace depth for nested object context
    for (const ch of text) {
      if (ch === "{") {
        braceDepth++;
      } else if (ch === "}") {
        braceDepth--;
        if (braceDepth < expectedDepth) {
          // Left a context we were tracking
          const parts = currentPrefix.split(".");
          parts.pop();
          currentPrefix = parts.join(".");
          expectedDepth--;
        }
      }
    }

    const match = text.match(keyPattern);
    if (!match) {
      continue;
    }

    // Extract the full key from the line
    const keyPart = text.match(
      /^\s*((?:"[^"]+"|[a-zA-Z_][a-zA-Z0-9_\-]*)(?:\s*\.\s*(?:"[^"]+"|[a-zA-Z_][a-zA-Z0-9_\-]*))*)/
    );
    if (!keyPart) {
      continue;
    }

    const rawKey = keyPart[1]
      .replace(/"/g, "")
      .replace(/\s*\.\s*/g, ".");

    const fullKey = currentPrefix ? `${currentPrefix}.${rawKey}` : rawKey;

    if (fullKey === targetKey) {
      const keyStartIndex = text.indexOf(keyPart[1].trimStart());
      return new vscode.Location(
        document.uri,
        new vscode.Position(i, keyStartIndex)
      );
    }

    // If the line opens a brace block and the target starts with this key prefix,
    // track the context so nested keys resolve correctly
    if (
      text.trimEnd().endsWith("{") &&
      targetKey.startsWith(fullKey + ".")
    ) {
      currentPrefix = fullKey;
      expectedDepth = braceDepth;
    }
  }

  return null;
}

export function deactivate() {}
