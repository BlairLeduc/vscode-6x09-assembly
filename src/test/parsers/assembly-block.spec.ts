import * as vscode from 'vscode';
import { Token, TokenKind, TokenType } from '../../constants';
import { AssemblyBlock, AssemblySymbol } from '../../parsers';

describe('AssemblyBlock', () => {
  it('should create', () => {
    const block = new AssemblyBlock(1, 2);
    expect(block.number).toBe(1);
    expect(block.startLineNumber).toBe(2);
    expect(block.endLineNumber).toBe(2);
    expect(block.label).toBeFalsy();
    expect(block.symbols.length).toBe(0);
  });
  it('should create with label', () => {
    const token = new Token('foo', 0, 3, TokenKind.label, TokenType.label);
    const label = new AssemblySymbol(token, vscode.Uri.file('foo'), 0, 0);
    const block = new AssemblyBlock(1, 2, label);
    expect(block.number).toBe(1);
    expect(block.startLineNumber).toBe(2);
    expect(block.endLineNumber).toBe(2);
    expect(block.label).toBe(label);
    expect(block.symbols.length).toBe(0);
  });
});