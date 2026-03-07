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

      const text = editor.document.getText();

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

  context.subscriptions.push(command);
}

export function deactivate() {}
