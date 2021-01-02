# Change Log

All notable changes to the "vscode-6x09-assembly" extension will be documented in this file.

## [0.6.0]

- Added documentation for 6309 opcodes from the sources available.  The documentation still has room for improvement.
- Added provided tasks for assembling with `lwasm` and running your code with `XRoar`.
- Removed command to start an emulator (a task replaced this).

## [0.5.0]

- Loads symbols from definitions files (use/include).
- Adds a command to start an emulator.

## [0.4.0]

- Added documentation for opcodes and pseudo-ops from the datasheet (6809 only). This needs work since the datasheet is not perfect.
- Added macros to completion with comments.
- Bug Fix: Parser does not match syntax highlighting.
- Bug Fix: For macros, go to definition and find/peek reference not working.
- Completions are classified to help choose the correct symbol.
- Setting to choose uppercase/lowercase/capitalized opcodes in completion.
- Commands to update assembly file to upper/lowercase/capitalize opcodes.
- Hover over symbols, opcodes and macros to see help documentation or comments.
- Show all symbol definitions within a document.
- Rename symbols in document.
- Code lens for labels.

## [0.3.0]

- Greatly improved syntax highlighting
- Shows comments on symbol completion (taken from the line where the symbol was defined)
- Go to the definition of a symbol
- Find all references to a symbol
- Highlight all occurrences of a symbol in the assembly file
- Performance improvements

## [0.2.0]

- Added symbol completion when in the operand to defined labels

## [0.1.2]

- Added problem matcher for `lwasm`

## [0.1.1]

- Initial release
- Syntax Highlighting, bracket matching, bracket autoclosing, brack surrounding, comment toggling, auto-indentation and folding
