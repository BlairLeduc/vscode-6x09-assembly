# vscode-6x09-assembly

This is a Visual Studio extenstion for 6x09 Assembly language.

The support files extensions are `.asm` and `.a`.

*This extensin is in a minimum viable product (MVP) state.*

## Structure

```
.
├── client // Language Client
│   ├── src
│   │   ├── test // End to End tests for Language Client / Server
│   │   └── extension.ts // Language Client entry point
├── package.json // The extension manifest.
└── server // Language Server
    └── src
        └── server.ts // Language Server entry point
```

## Current Functionality

- Syntax highlighting for 6809 assembly language.
- Completions
- Diagnostics regenerated on each file change or configuration change

## Roadmap

- Syntax highlighter for 6309 assembply language.
Deeping completions and diagnotics through continuous assembly of source

## How to run this extension for development

- Run `npm install` in this folder. This installs all necessary npm modules in both the client and server folder
- Open VS Code on this folder.
- Press Ctrl+Shift+B to compile the client and server.
- Switch to the Debug viewlet.
- Select `Launch Client` from the drop down.
- Run the launch config.
- If you want to debug the server as well use the launch configuration `Attach to Server`
- In the [Extension Development Host] instance of VSCode, open a document in '6x09 Assembly' language mode.
  - Type `j` or `t` to see `Javascript` and `TypeScript` completion.
  - Enter or load 6x09 assembly content. The extension will emit diagnostics.

