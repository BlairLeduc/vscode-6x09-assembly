import * as vscode from 'vscode';

export const Registers = ['a', 'b', 'd', 'e', 'f', 'x', 'y', 'w', 'q', 'u', 's', 'v', 'pc', 'dp', 'cc', 'pcr'];
export const referencableKinds = [
  vscode.CompletionItemKind.Class,
  vscode.CompletionItemKind.Function,
  vscode.CompletionItemKind.Method,
  vscode.CompletionItemKind.Constant,
  vscode.CompletionItemKind.Variable,
];
export class AssemblyToken {
  public blockNumber: number;
  public parent: AssemblyToken;
  public children: AssemblyToken[];
  public documentation: string;
  public uri: vscode.Uri;

  constructor(
    public text: string,
    public range: vscode.Range,
    public lineRange: vscode.Range,
    public kind: vscode.CompletionItemKind,
    public tokenType: string,
    public tokenModifiers: string[] = [],
    public value: string = '',
  ) {
    this.blockNumber = 0;
    this.children = [];
    this.documentation = '';
  }
}

export class AssemblySymbol {
  constructor(
    public name: string,
    public range: vscode.Range,
    public documentation: string,
    public kind: vscode.CompletionItemKind,
    public lineRange: vscode.Range,
    public uri: vscode.Uri,
    public value: string = '', // for constants
  ) { }
}

export class AssemblyReference {
  constructor(
    public range: vscode.Range,
    public lineRange: vscode.Range,
    public uri: vscode.Uri,

  ) { }
}