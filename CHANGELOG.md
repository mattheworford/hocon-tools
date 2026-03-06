# Change Log

All notable changes to the "hocon-tools" extension will be documented in this file.

## [0.0.7] - Unreleased

### Added
- Block comment (`/* */`) syntax highlighting
- Grammar test suite using `vscode-tmgrammar-test`
- CI workflow via GitHub Actions
- Folding markers and `wordPattern` in language configuration

### Fixed
- Key regex now supports quoted keys with special characters and unquoted keys with `/`
- Number pattern no longer matches partial words (e.g., inside identifiers)
- Removed invalid `application.*.conf` glob from `filenames` (VS Code doesn't support globs there)
- Cleaned up template comments from `language-configuration.json`

## [0.0.6]

### Changed
- Published to Open VSX registry

## [0.0.4]

### Changed
- Improved discoverability with additional keywords and metadata
- Updated `package.json` with gallery banner, sponsor, and pricing fields

## [0.0.3]

### Changed
- Added extension icon for marketplace
- Added repository and license configuration
- Re-ordered grammar rules to correctly identify constants

## [0.0.2]

### Changed
- Updated grammar for `include` keyword support
- Formatted grammar file

## [0.0.1]

### Added
- Initial release with HOCON syntax highlighting
- Support for `.conf` and `.hocon` file extensions
- Line comments (`//` and `#`)
- Key-value pairs, substitutions, strings, numbers, booleans, null
- Nested objects and arrays
