import * as vscode from 'vscode';

export const Registers = ['a', 'b', 'd', 'e', 'f', 'x', 'y', 'w', 'q', 'u', 's', 'v', 'pc', 'dp', 'cc', 'pcr'];
export const referencableKinds = [
  vscode.CompletionItemKind.Class,
  vscode.CompletionItemKind.Function,
  vscode.CompletionItemKind.Method,
  vscode.CompletionItemKind.Constant,
  vscode.CompletionItemKind.Variable,
];

export enum TokenKind {
  Constant = 0,
  Variable = 1,
  Macro = 2,
  Struct = 3,
  GlobalLabel = 4,
  LocalLabel = 5,
  Opcode = 6,
  String = 7,
  Number = 8,
  Operator = 9,
  Reference = 10,
  Comment = 11,
  File = 12,
}

const CompletionItemKindTranslation = [
  vscode.CompletionItemKind.Constant,
  vscode.CompletionItemKind.Variable,
  vscode.CompletionItemKind.Method,
  vscode.CompletionItemKind.Struct,
  vscode.CompletionItemKind.Class,
  vscode.CompletionItemKind.Function,
  vscode.CompletionItemKind.Keyword,
  vscode.CompletionItemKind.Text,
  vscode.CompletionItemKind.Value,
  vscode.CompletionItemKind.Operator,
  vscode.CompletionItemKind.Reference,
  vscode.CompletionItemKind.Text,
  vscode.CompletionItemKind.File,
];

export function convertTokenKindToComplitionItemKind(kind: TokenKind): vscode.CompletionItemKind {
  return CompletionItemKindTranslation[kind];
}

const SymbolKindTranslation = [
  vscode.SymbolKind.Constant,
  vscode.SymbolKind.Variable,
  vscode.SymbolKind.Method,
  vscode.SymbolKind.Struct,
  vscode.SymbolKind.Class,
  vscode.SymbolKind.Function,
  vscode.SymbolKind.Key,
  vscode.SymbolKind.String,
  vscode.SymbolKind.Number,
  vscode.SymbolKind.Operator,
  vscode.SymbolKind.Object,
  vscode.SymbolKind.String,
  vscode.SymbolKind.File,
];

export function convertTokenKindToSymbolKind(kind: TokenKind): vscode.SymbolKind {
  return SymbolKindTranslation[kind];
}

const TokenTypeTranslation = [
  'variable',
  'variable',
  'macro',
  'struct',
  'class',
  'function',
  'keyword',
  'string',
  'number',
  'operator',
  'variable',
  'comment',
  'string',
];

export function convertTokenKindToTokenType(kind: TokenKind): string {
  return TokenTypeTranslation[kind];
}


export class AssemblyToken {
  public blockNumber: number;
  public parent: AssemblyToken;
  public children: AssemblyToken[];
  public documentation: string;
  public uri: vscode.Uri;
  public isLocal: boolean;

  constructor(
    public text: string,
    public range: vscode.Range,
    public lineRange: vscode.Range,
    public kind: vscode.CompletionItemKind,
    public tokenType: string,
    public tokenModifiers: string[] = [],
    public value: string = '',
  ) {
    this.isLocal = false;
    this.blockNumber = 0;
    this.children = [];
    this.documentation = '';
  }
}

export class AssemblyBlock {
  constructor(
    public number: number, 
    public label: AssemblyToken = null, 
    public tokens: AssemblyToken[] = [],
    ) {}
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