import * as vscode from 'vscode';
import { Token, TokenKind, TokenModifier, TokenType } from '../../constants';
import { AssemblyLine, AssemblySymbol, ParserState } from '../../parsers';

describe('AssemblyLine', () => {
  const uri = vscode.Uri.file('test.asm');
  const expectedLineNumber = 20;
  let state: ParserState;
  beforeEach(() => {
    state = {
      lonelyLabels: [],
      blockNumber: 1,
      struct: undefined,
      macro: undefined
    };
  });
  it('should increment state block number for empty line', () => {
    const _ = new AssemblyLine(uri, '', state, 20);
    expect(state.blockNumber).toBe(2);
  });
  it('should not increment state block number for line with content', () => {
    const _ = new AssemblyLine(uri, 'test', state, 20);
    expect(state.blockNumber).toBe(1);
  });
  it('should find global label', () => {
    const line = new AssemblyLine(uri, 'test', state, expectedLineNumber);
    expect(line).toBeTruthy();
    expect(line.label).toBeTruthy();
    expect(line.label?.text).toBe('test');
    expect(line.label?.lineNumber).toBe(expectedLineNumber);
    expect(line.label?.blockNumber).toBe(0);
    expect(line.label?.isLocal).toBe(false);
    expect(line.label?.range).toStrictEqual(new vscode.Range(expectedLineNumber, 0, expectedLineNumber, 4));
    expect(line.opCode).toBeFalsy();
    expect(line.operand).toBeFalsy();
  });
  it('should find local label', () => {
    const line = new AssemblyLine(uri, 'test@', state, expectedLineNumber);
    expect(line).toBeTruthy();
    expect(line.label).toBeTruthy();
    expect(line.label?.text).toBe('test@');
    expect(line.label?.lineNumber).toBe(expectedLineNumber);
    expect(line.label?.blockNumber).toBe(1);
    expect(line.label?.isLocal).toBe(true);
    expect(line.label?.range).toStrictEqual(new vscode.Range(expectedLineNumber, 0, expectedLineNumber, 5));
    expect(line.opCode).toBeFalsy();
    expect(line.operand).toBeFalsy();
  });
  it('should find lonely label', () => {
    const _ = new AssemblyLine(uri, 'test', state, 20);
    expect(state.lonelyLabels.length).toBe(1);
    expect(state.lonelyLabels[0].text).toBe('test');

  });
  it('should find symbol with opcode and no lonely labels', () => {
    const line = new AssemblyLine(uri, 'test clra', state, expectedLineNumber);
    expect(line).toBeTruthy();
    expect(line.label).toBeTruthy();
    expect(line.label?.text).toBe('test');

    expect(line.opCode).toBeTruthy();
    expect(line.opCode?.text).toBe('clra');
    expect(line.opCode?.char).toBe(5);
    expect(line.opCode?.length).toBe(4);
    expect(line.operand).toBeFalsy();

    expect(state.lonelyLabels.length).toBe(0);
  });
  it('should find symbol with opcode and operand and no lonely labels', () => {
    const line = new AssemblyLine(uri, 'test lda #42', state, expectedLineNumber);
    expect(line).toBeTruthy();
    expect(line.label).toBeTruthy();
    expect(line.label?.text).toBe('test');
    expect(line.label?.lineNumber).toBe(expectedLineNumber);
    expect(line.label?.blockNumber).toBe(0);
    expect(line.label?.isLocal).toBe(false);

    expect(line.opCode).toBeTruthy();
    expect(line.opCode?.text).toBe('lda');
    expect(line.opCode?.char).toBe(5);
    expect(line.opCode?.length).toBe(3);

    expect(line.operand).toBeTruthy();
    expect(line.operand?.text).toBe('#42');
    expect(line.operand?.char).toBe(9);
    expect(line.operand?.length).toBe(3);

    expect(state.lonelyLabels.length).toBe(0);
  });
  it('should an opcode and operand containing a reference', () => {
    const line = new AssemblyLine(uri, ' lda #ref', state, expectedLineNumber);
    expect(line).toBeTruthy();
    expect(line.label).toBeFalsy();

    expect(line.opCode).toBeTruthy();
    expect(line.opCode?.text).toBe('lda');
    expect(line.opCode?.char).toBe(1);
    expect(line.opCode?.length).toBe(3);

    expect(line.operand).toBeTruthy();
    expect(line.operand?.text).toBe('#ref');
    expect(line.operand?.char).toBe(5);
    expect(line.operand?.length).toBe(4);

    expect(line.references.length).toBe(1);
    expect(line.references[0].text).toBe('ref');
    expect(line.references[0].lineNumber).toBe(expectedLineNumber);
    expect(line.references[0].blockNumber).toBe(0);

    expect(state.lonelyLabels.length).toBe(0);
  });
  it('should an opcode and operand containing a reference and property', () => {
    const line = new AssemblyLine(uri, ' lda #ref.test', state, expectedLineNumber);
    expect(line).toBeTruthy();
    expect(line.label).toBeFalsy();

    expect(line.opCode).toBeTruthy();
    expect(line.opCode?.text).toBe('lda');
    expect(line.opCode?.char).toBe(1);
    expect(line.opCode?.length).toBe(3);

    expect(line.operand).toBeTruthy();
    expect(line.operand?.text).toBe('#ref.test');
    expect(line.operand?.char).toBe(5);
    expect(line.operand?.length).toBe(9);

    expect(line.references.length).toBe(1);
    expect(line.references[0].text).toBe('ref');
    expect(line.references[0].lineNumber).toBe(expectedLineNumber);
    expect(line.references[0].blockNumber).toBe(0);
    expect(line.references[0].properties.length).toBe(1);
    expect(line.references[0].properties[0].text).toBe('test');

    expect(line.properties.length).toBe(1);
    expect(line.properties[0].text).toBe('test');

    expect(state.lonelyLabels.length).toBe(0);
  });
  it('should find a file reference', () => {
    const line = new AssemblyLine(uri, ' include "test.asm"', state, expectedLineNumber);

    expect(line).toBeTruthy();
    expect(line.file).toBeTruthy();
    expect(line.file).toBe('test.asm');
  });
  it('should find a comment', () => {
    const line = new AssemblyLine(uri, 'label ; test', state, expectedLineNumber);

    expect(line).toBeTruthy();
    expect(line.label).toBeTruthy();
    expect(line.label?.documentation).toBe('test');
  });
  it('should find a comment for a lonley label', () => {
    const token = new Token('label', 0, expectedLineNumber - 1, TokenKind.label, TokenType.label, true, true);
    state.lonelyLabels.push(new AssemblySymbol(token, uri, expectedLineNumber - 1, 0));
    const line = new AssemblyLine(uri, ' ; test', state, expectedLineNumber);

    expect(line).toBeTruthy();
    expect(state.lonelyLabels.length).toBe(1);
    expect(state.lonelyLabels[0].documentation).toBe('  \ntest');
  });
  it('should process equ pseudo op', () => {
    const line = new AssemblyLine(uri, 'label equ 42', state, expectedLineNumber);

    expect(line).toBeTruthy();
    expect(line.label).toBeTruthy();
    expect(line.label?.text).toBe('label');
    expect(line.label?.value).toBe('42');
    expect(line.label?.range).toStrictEqual(new vscode.Range(expectedLineNumber, 0, expectedLineNumber, 5));
    expect(line.label?.semanticToken.type).toBe(TokenType.variable);
    expect(line.label?.semanticToken.modifiers).toBe(TokenModifier.readonly | TokenModifier.definition);
  });
  it('should process storage pseudo op', () => {
    const line = new AssemblyLine(uri, 'label rmb 42', state, expectedLineNumber);

    expect(line).toBeTruthy();
    expect(line.label).toBeTruthy();
    expect(line.label?.text).toBe('label');
    expect(line.label?.value).toBe('');
    expect(line.label?.kind).toBe(vscode.CompletionItemKind.Variable);
    expect(line.label?.semanticToken.type).toBe(TokenType.variable);
    expect(line.label?.semanticToken.modifiers).toBe(TokenModifier.definition);
  });
  it('should process storage pseudo op for a property', () => {
    const token = new Token('label', 0, expectedLineNumber - 1, TokenKind.label, TokenType.class, true, true);
    state.struct = new AssemblySymbol(token, uri, expectedLineNumber - 1, 0);
    const line = new AssemblyLine(uri, 'test rmb 42', state, expectedLineNumber);

    expect(line).toBeTruthy();
    expect(line.label).toBeTruthy();
    expect(line.label?.text).toBe('test');
    expect(line.label?.value).toBe('');
    expect(line.label?.kind).toBe(vscode.CompletionItemKind.Property);
    expect(line.label?.semanticToken.type).toBe(TokenType.property);
    expect(line.label?.semanticToken.modifiers).toBe(TokenModifier.definition);
  });
  it('should process macro definition', () => {
    const line = new AssemblyLine(uri, 'label macro', state, expectedLineNumber);

    expect(line).toBeTruthy();
    expect(line.label).toBeTruthy();
    expect(line.label?.text).toBe('label');
    expect(line.label?.kind).toBe(vscode.CompletionItemKind.Method);
    expect(line.label?.semanticToken.type).toBe(TokenType.macro);
    expect(line.label?.semanticToken.modifiers).toBe(TokenModifier.definition);
    expect(state.macro).toBeTruthy();
    expect(state.macro!.text).toBe('label');
  });
  it('should process the end of a macro definition', () => {
    const token = new Token('label', 0, expectedLineNumber - 1, TokenKind.label, TokenType.macro, true, true);
    state.macro = new AssemblySymbol(token, uri, expectedLineNumber - 1, 0);
    const line = new AssemblyLine(uri, ' endm', state, expectedLineNumber);

    expect(line).toBeTruthy();
    expect(line.label).toBeFalsy();
    expect(state.macro).toBeFalsy();
  });
  it('should process struct definition', () => {
    const line = new AssemblyLine(uri, 'label struct', state, expectedLineNumber);

    expect(line).toBeTruthy();
    expect(line.label).toBeTruthy();
    expect(line.label?.text).toBe('label');
    expect(line.label?.kind).toBe(vscode.CompletionItemKind.Struct);
    expect(line.label?.semanticToken.type).toBe(TokenType.struct);
    expect(line.label?.semanticToken.modifiers).toBe(TokenModifier.definition);
    expect(state.struct).toBeTruthy();
    expect(state.struct?.text).toBe('label');
  });
  it('should process the end of a struct definition', () => {
    const token = new Token('label', 0, expectedLineNumber - 1, TokenKind.label, TokenType.struct, true, true);
    state.struct = new AssemblySymbol(token, uri, expectedLineNumber - 1, 0);
    const line = new AssemblyLine(uri, ' ends', state, expectedLineNumber);

    expect(line).toBeTruthy();
    expect(line.label).toBeFalsy();
    expect(state.struct).toBeFalsy();
  });
  it('should process export pseudo op', () => {
    const line = new AssemblyLine(uri, 'label export', state, expectedLineNumber);

    expect(line).toBeTruthy();
    expect(line.label).toBeTruthy();
    expect(line.label?.text).toBe('label');
    expect(line.label?.kind).toBe(vscode.CompletionItemKind.Reference);
    expect(line.label?.semanticToken.type).toBe(TokenType.variable);
  });
  it('should process a macro or struct', () => {
    const line = new AssemblyLine(uri, 'label testStruct', state, expectedLineNumber);

    expect(line).toBeTruthy();
    expect(line.label).toBeTruthy();
    expect(line.label?.text).toBe('label');
    expect(line.label?.kind).toBe(vscode.CompletionItemKind.Variable);
    expect(line.label?.semanticToken.type).toBe(TokenType.variable);
    expect(line.label?.semanticToken.modifiers).toBe(0);
    expect(line.type).toBeTruthy();
    expect(line.type?.text).toBe('teststruct');
    expect(line.type?.kind).toBe(vscode.CompletionItemKind.Function);
    expect(line.type?.semanticToken.type).toBe(TokenType.function);
    expect(state.macro).toBeFalsy();
    expect(state.struct).toBeFalsy();
  });
});
