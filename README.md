# HOCON Tools for Visual Studio Code

This extension provides syntax highlighting support for HOCON (Human-Optimized Config Object Notation) files in Visual Studio Code. HOCON is a JSON superset used for configuration files that is designed to be more human-friendly, allowing for more flexible syntax, comments, and includes.

## Features

- **Syntax Highlighting**: Provides robust syntax highlighting for HOCON files, including:
  - Keys and values, with support for both quoted and unquoted keys.
  - Comments using `//` or `#`.
  - Arrays and objects, including flexible comma rules.
  - Support for HOCON-specific features like include statements.
  - Highlighting for valid and invalid syntax patterns.

## Installation

You can install this extension directly from the Visual Studio Code Marketplace:

1. Open Visual Studio Code.
2. Go to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window.
3. Search for "HOCON Syntax Highlighting".
4. Click **Install** to add the extension to your editor.

Alternatively, you can download the extension from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/).

## Usage

Once the extension is installed, it will automatically recognize files with the `.conf` extension as HOCON files and apply syntax highlighting. You can also manually select "HOCON" as the language mode for any open file by clicking on the language mode indicator in the bottom-right corner of the editor.

## Example

Here’s a sample HOCON file to see the syntax highlighting in action:

```hocon
// This is a HOCON file

include "other.conf"

root {
    key1 = "value1"
    key2 {
        subkey1 = 123
        subkey2 = true
    }
    array = [
        1,
        2,
        3
    ]
}
```

## Limitations

- Currently, this extension only supports syntax highlighting. Advanced features like code completion, validation, and formatting are not yet implemented.

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/mattheworford/hocon-tools).

## License

This extension is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.