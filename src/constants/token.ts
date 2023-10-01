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
  ignore = 0,
  label = 1,
  opCode = 2,
  operand = 3,
  reference = 4,
  comment = 5,
  file = 6,
  parameter = 7,
  property = 8,
  macroOrStruct = 9,
}

export enum TokenType {
  namespace = 0, // Tells the semantic syntax highlight to ignore
  class = 1,
  function = 2,
  struct = 3,
  variable = 4,
  label = 5,
  property = 6,
  macro = 7,
  string = 8,
  comment = 9,
  keyword = 10,
  number = 11,
  operator = 12,
  type = 13,
  parameter = 14,
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

export const tokenTypeToString = [
  'namespace', // Tells the semantic syntax highlight to ignore
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


