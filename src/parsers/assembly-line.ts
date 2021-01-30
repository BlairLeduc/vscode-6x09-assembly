import { CompletionItemKind, Range, Uri } from 'vscode';
// import { AssemblyToken, Registers, Token, TokenKind, TokenModifier, TokenType } from '../common';
import { AssemblySymbol, constantPseudoOps, Token, TokenKind, TokenModifier, TokenType } from '../common';
import { LineParser } from './line-parser';

// interface MatchedItem {
//   tokenType: string;
//   text: string;
//   pos: number;
// }

export interface SymbolReference {
  name: string;
  range: Range;
  definition: AssemblySymbol;
  uri: Uri;
}

export interface ParserState {
  lonelyLabels: AssemblySymbol[];
  blockNumber: number;
  struct: AssemblySymbol;
  macro: AssemblySymbol;
}

export class AssemblyLine {
  private static storageRegExp: RegExp;

  public state: ParserState;

  public lineNumber = 0;
  public lineRange: Range;
  public blockNumber = 0;

  public label: AssemblySymbol;
  public labelRange: Range;
  public opCode: Token;
  public opCodeRange: Range;
  public operandRange: Range;


  //public tokens: AssemblyToken[];
  public semanicTokens: Token[];
  public file: string;
  public references: AssemblySymbol[];

  constructor(private rawLine: string, state?: ParserState, rawLineNumber?: number) {
    if (rawLineNumber) {
      this.lineNumber = rawLineNumber;
    }
    this.lineRange = this.getRange(0, this.rawLine.length);

    this.state = state ? state : state = { lonelyLabels: [], blockNumber: 1, struct: null } as ParserState;
    this.references = [];

    if (!AssemblyLine.storageRegExp) {
      const s1 = '[.](4byte|asci[isz]|blkb|byte|d[bsw]|globl|quad|rs|str[sz]?|word)|f[dq]b|fc[bcns]|import|[zr]m[dbq]';
      const s2 = '|includebin|fill';
      AssemblyLine.storageRegExp = new RegExp('^(' + s1 + s2 + ')$', 'i');
    }
    this.parse();
  }

  private parse(): void {
    this.semanicTokens = LineParser.parse(this.rawLine);

    if (this.semanicTokens.length == 0) {
      this.state.blockNumber++;
      return;
    }

    this.blockNumber = this.state.blockNumber;

    let clearLonelyLabels = false;
    this.semanicTokens.forEach((token, index, tokens) => {
      switch (token.kind) {
        case TokenKind.label:
          this.label = new AssemblySymbol(token, this.lineRange);
          this.state.lonelyLabels.push(this.label);
          break;
        case TokenKind.opCode:
          clearLonelyLabels = true;
          this.opCodeRange = new Range(this.lineNumber, token.char, this.lineNumber, token.char + token.length);
          this.opCode = token;
          this.processOpCode(token, tokens, index);
          break;
        case TokenKind.operand:
          this.operandRange = this.getRangeFromToken(token);
          break;
        case TokenKind.reference:
          this.references.push(new AssemblySymbol(token, this.lineRange));
          break;
        case TokenKind.comment:
          this.updateLabels(label => label.documentation += '  \n' + token.text);
          break;
        case TokenKind.file:
          this.file = token.text;
          break;
      }
    });

    if (clearLonelyLabels) {
      this.state.lonelyLabels = [];
    }

    return;
  }

  private processOpCode(token: Token, tokens: Token[], index: number) {
    if (constantPseudoOps.has(token.text) && tokens.length > index) {
      this.updateLabels(label => {
        label.semanticToken.type = TokenType.variable;
        label.semanticToken.modifiers = TokenModifier.readonly || TokenModifier.definition;
        label.value = tokens[index + 1].text;
      });
    }
    else if (AssemblyLine.storageRegExp.test(token.text) && tokens.length > index) {
      this.updateLabels(label => {
        label.semanticToken.type = TokenType.variable;
        label.semanticToken.modifiers = TokenModifier.declaration;
        label.kind = CompletionItemKind.Variable;
        if (this.state.struct) {
          label.text = `${this.state.struct}.${label.semanticToken.text}`;
        }
      });
    }
    else if (token.text.toLowerCase() === 'macro') {
      this.updateLabels(label => {
        label.semanticToken.type = TokenType.macro;
        label.semanticToken.modifiers = TokenModifier.declaration;
        label.kind = CompletionItemKind.Method;
      });
      this.state.macro = new AssemblySymbol(token, this.lineRange);
    }
    else if (token.text.toLowerCase().startsWith('endm')) {
      this.state.macro = null;
    }
    else if (token.text.toLowerCase() === 'struct') {
      this.updateLabels(label => {
        label.semanticToken.type = TokenType.struct;
        label.semanticToken.modifiers = TokenModifier.declaration;
        label.kind = CompletionItemKind.Struct;
      });
      this.state.struct = new AssemblySymbol(token, this.lineRange);
    }
    else if (token.text.toLowerCase().startsWith('ends')) {
      this.state.struct = null;
    }
    else if (token.text.toLowerCase() === 'export') {
      this.updateLabels(label => {
        label.semanticToken.type = TokenType.variable;
        label.kind = CompletionItemKind.Reference;
      });
    }
  }

  private updateLabels(func: (at: AssemblySymbol) => void) {
    this.state.lonelyLabels.forEach(label => func(label));
  }

  private getRange(char: number, length: number): Range {
    return new Range(this.lineNumber, char, this.lineNumber, char + length);
  }

  private getRangeFromToken(token: Token) {
    return new Range(this.lineNumber, token.char, this.lineNumber, token.char + token.length);
  }
}
