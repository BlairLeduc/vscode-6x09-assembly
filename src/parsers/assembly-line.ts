import * as vscode from 'vscode';
import {
  AssemblySymbol,
  constantPseudoOps,
  Token,
  TokenKind,
  TokenModifier,
  TokenType } from '../common';
import { LineParser } from './line-parser';

export interface SymbolReference {
  name: string;
  range: vscode.Range;
  definition: AssemblySymbol;
  uri: vscode.Uri;
}

export interface ParserState {
  lonelyLabels: AssemblySymbol[];
  blockNumber: number;
  struct?: AssemblySymbol;
  macro?: AssemblySymbol;
}

export class AssemblyLine {
  private static storageRegExp: RegExp;

  public lineNumber = 0;
  public lineRange: vscode.Range;
  public blockNumber = 0;

  public label?: AssemblySymbol;
  public labelRange?: vscode.Range;
  public opCode?: Token;
  public opCodeRange?: vscode.Range;
  public type?: AssemblySymbol;
  public typeRange?: vscode.Range;
  public operand?: Token;
  public operandRange?: vscode.Range;

  public semanicTokens?: Token[];
  public file?: string;
  public references: AssemblySymbol[] = [];
  public properties: AssemblySymbol[] = [];

  constructor(
    public uri: vscode.Uri,
    private rawLine: string,
    public state: ParserState,
    rawLineNumber?: number) {

    if (rawLineNumber) {
      this.lineNumber = rawLineNumber;
    }
    this.lineRange = this.getRange(0, this.rawLine.length);

    if (!AssemblyLine.storageRegExp) {
      const s1 = '[.](4byte|asci[isz]|blkb|byte|d[bsw]|globl|quad|rs|str[sz]?|word)|f[dq]b|fc[bcns]|import|[zr]m[dbq]';
      const s2 = '|includebin|fill';
      AssemblyLine.storageRegExp = new RegExp('^(' + s1 + s2 + ')$', 'i');
    }
    this.parse();
  }

  private parse(): void {
    this.semanicTokens = LineParser.parse(this.rawLine);

    if (this.semanicTokens.length === 0) {
      this.state.blockNumber++;
      return;
    }

    this.blockNumber = this.state.blockNumber;

    let clearLonelyLabels = false;
    let lastReference: AssemblySymbol | undefined = undefined;
    this.semanicTokens.forEach((token, index, tokens) => {
      switch (token.kind) {
        case TokenKind.label:
          this.label = new AssemblySymbol(token, this.uri, this.lineRange, this.state.blockNumber);
          this.state.lonelyLabels.push(this.label);
          break;
        case TokenKind.macroOrStruct:
          clearLonelyLabels = true;
          this.typeRange = new vscode.Range(
            this.lineNumber,
            token.char,
            this.lineNumber,
            token.char + token.length);
          this.type = new AssemblySymbol(token, this.uri, this.lineRange, 0);
          this.updateLabels(label => {
            label.semanticToken.type = TokenType.variable;
            label.kind ===  vscode.CompletionItemKind.Variable;
            label.value = token.text;
          });
          break;
        case TokenKind.opCode:
          clearLonelyLabels = true;
          this.opCodeRange = new vscode.Range(
            this.lineNumber,
            token.char,
            this.lineNumber,
            token.char + token.length);
          this.opCode = token;
          this.processOpCode(token, tokens, index);
          break;
        case TokenKind.operand:
          this.operandRange = this.getRangeFromToken(token);
          this.operand = token;
          break;
        case TokenKind.reference:
          lastReference = new AssemblySymbol(token, this.uri, this.lineRange, this.state.blockNumber);
          this.references.push(lastReference);
          break;
        case TokenKind.property:
          if (lastReference) {
            const property = new AssemblySymbol(token, this.uri, this.lineRange, 0);
            property.parent = lastReference;
            lastReference.properties.push(property);
            lastReference = undefined;
            this.properties.push(property);
          }
          break;
        case TokenKind.comment:
          if (this.label) {
            this.label.documentation = token.text;
          } else if (!clearLonelyLabels) {
            this.updateLabels(label => label.documentation += '  \n' + token.text);
          }
          break;
        case TokenKind.file:
          this.file = token.text;
          break;
      }

      if (token.type === TokenType.operator && token.text !== '.') {
        lastReference = undefined;
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
        label.semanticToken.type = this.state.struct ? TokenType.property : TokenType.variable;
        label.semanticToken.modifiers = TokenModifier.definition;
        label.kind = this.state.struct
          ? vscode.CompletionItemKind.Property
          : vscode.CompletionItemKind.Variable;
        if (this.state.struct) {
          label.parent = this.state.struct;
          this.state.struct.properties.push(label);
        }
      });
    }
    else if (token.text.toLowerCase() === 'macro') {
      this.updateLabels(label => {
        this.state.macro = label;
        label.semanticToken.type = TokenType.macro;
        label.semanticToken.modifiers = TokenModifier.definition;
        label.kind = vscode.CompletionItemKind.Method;
      });
    }
    else if (token.text.toLowerCase().startsWith('endm')) {
      this.state.macro = undefined;
    }
    else if (token.text.toLowerCase() === 'struct') {
      this.updateLabels(label => {
        this.state.struct = label;
        label.semanticToken.type = TokenType.struct;
        label.semanticToken.modifiers = TokenModifier.definition;
        label.kind = vscode.CompletionItemKind.Struct;
      });
    }
    else if (token.text.toLowerCase().startsWith('ends')) {
      this.state.struct = undefined;
    }
    else if (token.text.toLowerCase() === 'export') {
      this.updateLabels(label => {
        label.semanticToken.type = TokenType.variable;
        label.kind = vscode.CompletionItemKind.Reference;
      });
    }
  }

  private updateLabels(func: (at: AssemblySymbol) => void) {
    this.state.lonelyLabels.forEach(label => func(label));
  }

  private getRange(char: number, length: number): vscode.Range {
    return new vscode.Range(this.lineNumber, char, this.lineNumber, char + length);
  }

  private getRangeFromToken(token: Token) {
    return new vscode.Range(this.lineNumber, token.char, this.lineNumber, token.char + token.length);
  }
}
