# Change Log
All notable changes to the "vscode-6x09-assembly" extension will be documented in this file.

## [0.4.0]
 - Added documenation for opcodes and psuedo ops from datasheet (6809 only). This needs work since the datasheet is not perfect. 
 - Added macros to completion with comments.
 - Bug Fix: Parser does not match syntax highlighting.
 - Bug Fix: For macros, go to definiton and find/peek reference not working.
 - Completions are classified to help choose correct symbol.
 - Setting to choose uppercase/lowercase/capitalised opcodes in completion.
 - Commands to update assembly file to upper/lowercase/capitalise opcodes.
 - Hover over symbols, opcodes and macros to see help documentation or comments.
 - Show all symbol defintions within a document.
 - Rename symbols in document.
 - Code lens for labels.
## [0.3.0]
- Greatly improved syntax highlighting
- Shows comments on symbol completion (taken from the line where the symbol was defined)
- Go to the definition of symbol
- Find all references to a symbol
- Highlight all occurances of a symbol in the assembly file
- Performance improvements
## [0.2.0]
- Added symbol completion when in the operand to defined labels
## [0.1.2]
- Added problem matcher for `lwasm`
## [0.1.1]
- Initial release
- Syntax Highlighting, bracket matching, bracket autoclosing, brack surronding, comment toggling, autoindentation and folding
