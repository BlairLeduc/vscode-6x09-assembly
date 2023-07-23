import * as vscode from 'vscode';

export const ASM6X09_LANGUAGE = 'asm6x09';
export const ASM6X09_CONFIG_SECTION = '6x09Assembly';
export const ASM6X09_MODE: vscode.DocumentSelector = { scheme: 'file', language: ASM6X09_LANGUAGE };
export const ASM6X09_FILE_EXTENSIONS = ['.asm', '.s', '.d', '.defs'];
export const ASM6X09_FILE_GLOB_PATTERN = `**/*.{s,d,asm,defs}`;

export const registers = new Set(
  ['a', 'b', 'd', 'e', 'f', 'x', 'y', 'w', 'q', 'u', 's', 'v', 'pc', 'dp', 'cc', 'pcr']);

export const inherentOpcodes = new Set([
  'abx',
  'asla', 'aslb', 'asld', 'asra', 'asrb', 'asrd',
  'clra', 'clrb', 'clrd', 'clre', 'clrf', 'clrw',
  'coma', 'comb', 'comd', 'come', 'comf', 'comw',
  'daa',
  'deca', 'decb', 'decd', 'dece', 'decf', 'decw',
  'inca', 'incb', 'incd', 'ince', 'incf', 'incw',
  'lsla', 'lslb', 'lsld', 'lsra', 'lsrb', 'lsrd', 'lsrw',
  'mul',
  'nega', 'negb', 'negd',
  'nop',
  'pshsw', 'pshuw', 'pulsw', 'puluw',
  'rola', 'rolb', 'rold', 'rolw', 'rora', 'rorb', 'rord', 'rorw',
  'rti', 'rts',
  'sex', 'sexw',
  'swi', 'swi2', 'swi3',
  'sync',
  'tsta', 'tstb', 'tstd', 'tste', 'tstf', 'tstw',
  'reorg', 'else', 'endc', 'emod', 'endm', 'endstruct', 'ends', 'endsection', 'endsect',
  'extern', 'external', 'import', 'export', '.globl', 'extdep',
]);

export const operandOpcodes = new Set([
  'adca', 'adcb', 'adcd', 'adcr',
  'adda', 'addb', 'addd', 'adde', 'addf', 'addr', 'addw',
  'aim',
  'anda', 'andb', 'andcc', 'andd', 'andr',
  'asl', 'asr', 'band', 'biand', 'beor', 'bieor',
  'bita', 'bitb', 'bitd', 'bitmd',
  'bor', 'bior',
  'bcc', 'lbcc', 'bcs', 'lbcs', 'beq', 'lbeq', 'bge', 'lbge', 'bgt', 'lbgt',
  'bhi', 'lbhi', 'bhs', 'lbhs', 'ble', 'lble', 'blo', 'lblo', 'bls', 'lbls',
  'blt', 'lblt', 'bmi', 'lbmi', 'bne', 'lbne', 'bpl', 'lbpl', 'bra', 'lbra',
  'brn', 'lbrn', 'bsr', 'lbsr', 'bvc', 'lbvc', 'bvs', 'lbvs',
  'clr',
  'cmpa', 'cmpb', 'cmpd', 'cmpe', 'cmpf', 'cmpr', 'cmps', 'cmpu', 'cmpw', 'cmpx', 'cmpy',
  'com', 'cwai', 'dec', 'divd', 'divq', 'eim',
  'eora', 'eorb', 'eord', 'eorr', 'exg', 'inc',
  'jmp', 'jsr',
  'lda', 'ldb', 'ldd', 'lde', 'ldf', 'ldmd', 'ldq', 'lds', 'ldu', 'ldw', 'ldx', 'ldy',
  'ldbt',
  'leas', 'leau', 'leax', 'leay',
  'lsl', 'lsr', 'muld', 'neg', 'oim',
  'ora', 'orb', 'orcc', 'ord', 'orr',
  'pshu', 'pshs', 'pulu', 'puls',
  'rol', 'ror',
  'sbca', 'sbcb', 'sbcd', 'sbcr',
  'sta', 'stb', 'std', 'ste', 'stf', 'stq', 'sts', 'stu', 'stw', 'stx', 'sty',
  'stbt',
  'suba', 'subb', 'subd', 'sube', 'subf', 'subr', 'subw',
  'tfm', 'tfr', 'tim', 'tst',
  '.4byte', '.area', '.ascii', '.ascis', '.asciz', '.blkb', '.byte',
  '.db', '.ds', '.dw', '.quad', '.rs', '.str', '.strs', '.strz', '.word',
  '*pragma', '*pragmapop', '*pragmapush',
  'align', 'end', 'equ', 'error',
  'fcb', 'fcc', 'fcn', 'fcs', 'fdb', 'fill',
  'fqb', 'ifdef', 'ifeq', 'ifge', 'ifgt', 'ifle', 'iflt', 'ifndef', 'ifne', 'ifpragma',
  'import', 'include', 'includebin', 'macro', 'mod', 'nam', 'org', 'os9', 'pragma',
  'rmb', 'rmd', 'rmq', 'sect', 'section', 'set', 'setdp', 'use', 'warning',
  'zmb', 'zmd', 'zmq',
]);

export const delimitedStringPseudoOps = new Set([
  'fcc', 'fcn', 'fcs',
  '.ascii', '.asciz', '.ascis',
  '.str', '.strz', '.strs',
  'nam',
]);

export const stringPseudoOps = new Set([
  'error', 'warning', '.module',
]);

export const filePseudoOps = new Set([
  'includebin', 'include', 'use',
]);

export const inherentPseudoOps = new Set([
  'reorg', 'else', 'endc', 'emod', 'endm', 'endstruct', 'ends', 'endsection', 'endsect',
  'extern', 'external', 'import', 'export', '.globl', 'extdep', 'struct',
]);

export const pragmaPseudoOps = new Set([
  '*pragma', '*pragmapop', '*pragmapush', 'pragma',
]);

export const pseudoOps = new Set([
  '.4byte', '.area', '.ascii', '.ascis', '.asciz', '.blkb', '.byte',
  '.db', '.ds', '.dw', '.quad', '.rs', '.str', '.strs', '.strz', '.word',
  '*pragma', '*pragmapop', '*pragmapush',
  'align', 'end', 'equ', 'error',
  'fcb', 'fcc', 'fcn', 'fcs', 'fdb', 'fill',
  'fqb', 'ifdef', 'ifeq', 'ifge', 'ifgt', 'ifle', 'iflt', 'ifndef', 'ifne', 'ifpragma',
  'import', 'include', 'includebin', 'macro', 'mod', 'nam', 'org', 'os9', 'pragma',
  'rmb', 'rmd', 'rmq', 'sect', 'section', 'set', 'setdp', 'use', 'warning',
  'zmb', 'zmd', 'zmq',
]);

export const constantPseudoOps = new Set([
  'equ', 'set',
]);

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



const completionItemKindTranslation = [
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

export function convertTokenKindToComplitionItemKind(kind: TokenKind): vscode.CompletionItemKind {
  return completionItemKindTranslation[kind];
}

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

export function convertTokenToName(token: Token): string {
  let name = tokenTypeToString[token.type];
  if (token.modifiers & TokenModifier.readonly) {
    name = 'constant';
  }
  if (token.type === TokenType.variable && token.modifiers === TokenModifier.static) {
    name = 'register';
  }
  return name;
}

const symbolKindTranslation = [
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

export function convertTokenKindToSymbolKind(kind: TokenKind): vscode.SymbolKind {
  return symbolKindTranslation[kind];
}

const tokenTypeTranslation = [
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

export function convertTokenKindToTokenType(kind: TokenKind): string {
  return tokenTypeTranslation[kind];
}

export class AssemblySymbol {
  public semanticToken: Token;
  public text: string;
  public range: vscode.Range; // The range of the symbol in the document
  public type: TokenType;
  public kind: vscode.CompletionItemKind;
  public value: string = "";
  public blockNumber: number;
  public parent?: AssemblySymbol;
  public properties: AssemblySymbol[];
  public documentation: string;
  public isValid: boolean;
  public isLocal: boolean;

  constructor(
    token: Token,
    public uri: vscode.Uri,
    public lineRange: vscode.Range,
    blockNumber: number) {

    this.semanticToken = token;
    this.text = token.text;
    this.range = new vscode.Range(
      lineRange.start.line,
      token.char,
      lineRange.start.line,
      token.char + token.length);
    this.kind = convertTokenKindToComplitionItemKind(token.kind);
    this.type = token.type;
    this.isLocal = token.isLocal;
    this.blockNumber = token.isLocal ? blockNumber : 0;
    this.properties = [];
    this.documentation = '';
    this.isValid = token.isValid;
    this.isLocal = token.isLocal;
  }
}

export class AssemblyBlock {
  public endLineNumber: number;
  public foldingRangeKind?: vscode.FoldingRangeKind;

  constructor(
    public number: number,
    public startLineNumber: number,
    public label?: AssemblySymbol,
    public symbols: AssemblySymbol[] = [],
  ) {
    this.endLineNumber = startLineNumber;
  }
}

  export function isTextDocument(
    document: vscode.TextDocument | vscode.Uri): document is vscode.TextDocument {

    return (document as vscode.TextDocument).lineCount !== undefined;
  }

  export function isUri(document: vscode.TextDocument | vscode.Uri): document is vscode.Uri {
    return (document as vscode.Uri).authority !== undefined;
  }

  export function pathJoin(...paths: string[]): string {
    return paths.map(p => p.replace(/[\/\s]+$/, '')).join('/');
  }

  export function basePath(uri: vscode.Uri): string {
    return uri.path.split('/').slice(0, -1).join('/') || '';
  }

  export function appendPath(uri: vscode.Uri, ...paths: string[]): vscode.Uri {
    return uri.with({ path: pathJoin(basePath(uri), ...paths) });
  }
