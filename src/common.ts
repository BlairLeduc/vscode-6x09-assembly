import * as vscode from 'vscode';

export class AssemblySymbol {
    constructor(
      public name: string,
      public range: vscode.Range,
      public documentation: string,
      public kind: vscode.CompletionItemKind,
      public lineRange: vscode.Range,
      public uri: vscode.Uri
    ) { }
  }