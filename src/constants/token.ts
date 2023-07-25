import * as vscode from 'vscode';

// Tokin Kind translations
//
// (LineParser)          (AssemblySymbol)
// TokenKind             CompletionItemKind        SymbolKind
// ---------             ------------------        ----------
// ignore                Text                 *    String
// label                 Variable                  Variable
// opCode                Function                  Function
// operand               Variable                  Variable
// reference             Reference            *    Constant
// comment               Comment                   Comment
// file                  File                      File
// parameter             Variable                  Variable
// property              Property                  Property
// macroOrStruct         Class                     Class
//
// default:
//                       Text                 *    String

// Represetation
//                       TokenKind                TokenType
// Line Number           ignore                   label
// Comment               comment                  comment 
// Symbol                label                    function (local), class (global)             
// OpCode/PsueodOps      opCode                   keyword
// Macro/Struct          macroOrStruct            type
// Operand-String        operand                  string
// Operand-Pragmas       ignore                   parameter (separated by operator)
// Operand-File          file                     string
//

export enum TokenKind {
  ignore,
  label,
  opCode,
  operand,
  reference,
  comment,
  file,
  parameter,
  property,
  macroOrStruct,
}

export enum TokenType {
  class,
  function,
  struct,
  variable,
  label,
  property,
  macro,
  string,
  comment,
  keyword,
  number,
  operator,
  type,
  parameter,
  namespace, // Tells the semantic syntax highlight to ignore
}

export enum TokenModifier {
  none = 0,
  definition = 1,
  declaration = 2,
  readonly = 4,
  static = 8,
}

export class Token {
  public modifiers: TokenModifier;

  constructor(
    public text: string,
    public char: number,
    public length: number,
    public kind: TokenKind,
    public type: TokenType,
    public isValid: boolean = true,
    public isLocal: boolean = false,
  ) {
    this.modifiers = TokenModifier.none;
  }
}

export const completionItemKindTranslation = [
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
  vscode.CompletionItemKind.Property,
];

export const tokenTypeToString = [
  'global label',
  'local label',
  'struct',
  'data',
  'line number',
  'property',
  'macro',
  'string',
  'comment',
  'op code',
  'number',
  'operator',
  'type',
  'pragma',
  'namespace', // Tells the semantic syntax highlight to ignore
];

export const symbolKindTranslation = [
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
  vscode.SymbolKind.Property,
];

export const tokenTypeTranslation = [
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
  'property',
];


