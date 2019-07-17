# vscode-6x09-assembly

This is a Visual Studio extension for the 6x09 Assembly language.

This extension supports files with the extensions `.a`, `.asm` and `.d`.

## Screenshots

### Integration with `lwasm`
<img src="https://github.com/BlairLeduc/vscode-6x09-assembly/raw/master/media/lwasm-errors.png" width="480px">

### Opcode completion with documentation
<img src="https://github.com/BlairLeduc/vscode-6x09-assembly/raw/master/media/Opcode%20completion%20with%20docs.png" width="480px">

### Folding
<img src="https://github.com/BlairLeduc/vscode-6x09-assembly/raw/master/media/Sample-Syntax-Folding.png" width="340px">

### Hover documentation for opcodes
<img src="https://github.com/BlairLeduc/vscode-6x09-assembly/raw/master/media/Hover-opcode.png" width="480px">

### Code Lens showing number of references for labels
<img src="https://github.com/BlairLeduc/vscode-6x09-assembly/raw/master/media/codelens.png" width="640px">

### Commands
<img src="https://github.com/BlairLeduc/vscode-6x09-assembly/raw/master/media/commands.png" width="640px">

## Current Feature set

- Syntax highlighting for 6809 and 6309 assembly languages
  - Syntax Highlighting, bracket matching, bracket autoclosing, brack surrounding, comment toggling, auto-indentation and folding
  - Problem matcher for `lwasm`
- Completions for
  - Symbols in the operand, classified to separate labels, `equ`/`set` and macros. Comments on definition line included.
  - Opcodes and macros in the opcode column
    - Documentation for opcodes (comments for macros)
    - Opcodes also include documentation from the MC6809 datasheet.  This needs more work since the datasheet is not perfect and missing 6309 documentation.
    - Setting to choose uppercase/lowercase/capitalized opcodes in completion.
- Hover over symbols, opcodes and macros to see help documentation or comments (can be turned off in settings or level of documentation changed).
- Go to (Peek) the definition of a symbol
- Find all references to a symbol
- Highlight all occurrences of a symbol in the assembly file
- Search all symbol definitions within a document.
- Code lens for labels that shows the number of references to the label.
- Rename symbols in document.
- Commands to update assembly file to upper/lowercase/capitalize opcodes.

## Tasks

I have included a sample of tasks in the tasks folder.

For example, to use `lwasm` to assembly your file when you run the build task:

```json
{
  "label": "lwasm",
  "type": "shell",
  "command": "lwasm -b ${relativeFile} -o${fileBasenameNoExtension}.bin || true",
  "windows": {
    "command": "lwasm -b ${relativeFile} -o${fileBasenameNoExtension}.bin"
  },
  "group": {
    "kind": "build",
    "isDefault": true
  },
  "problemMatcher": [
    "$lwasm"
  ],
  "presentation": {
    "reveal": "never"
  }
}
```
