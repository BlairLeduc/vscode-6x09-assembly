import * as vscode from 'vscode';
import { convertTokenKindToComplitionItemKind } from '../../common';
import { Token, TokenKind, TokenType } from '../../constants';
import { AssemblySymbol } from '../../parsers';

describe('AssemblySymbol', () => {
  it('should create local', () => {
    const expectedBlockNumber = 24;
    const expectedLineNumber = 42;
    const token = new Token('foo', 0, 3, TokenKind.label, TokenType.label, true, true);

    const symbol = new AssemblySymbol(token, vscode.Uri.file('foo'), expectedLineNumber, expectedBlockNumber);

    expect(symbol.semanticToken).toBe(token);
    expect(symbol.text).toBe(token.text);
    expect(symbol.lineNumber).toBe(expectedLineNumber);
    expect(symbol.kind).toBe(convertTokenKindToComplitionItemKind(token.kind));
    expect(symbol.type).toBe(token.type);
    expect(symbol.isLocal).toBe(token.isLocal);
    expect(symbol.blockNumber).toBe(expectedBlockNumber);
    expect(symbol.properties.length).toBe(0);
    expect(symbol.documentation).toBe('');
    expect(symbol.isValid).toBe(token.isValid);
    expect(symbol.isLocal).toBe(token.isLocal);
  });
});
