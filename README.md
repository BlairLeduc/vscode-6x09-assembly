# vscode-6x09-assembly

This is a Visual Studio extension for 6x09 Assembly language.

This extension supports files extensions `.asm` and `.a`.

<img src="media/lwasm-errors.png" width="480px">

## Current Functionality

- Syntax highlighting for 6809 and 6309 assembly language.
  - Syntax Highlighting, bracket matching, bracket autoclosing, brack surronding, comment toggling, autoindentation and folding
  - Problem matcher for `lwasm`

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

## Roadmap

- Completions for nmemonics and sumbols.
- Linting
- Debugging
