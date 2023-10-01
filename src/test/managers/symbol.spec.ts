import * as vscode from 'vscode';
import { Token, TokenKind, TokenType } from '../../constants';
import { AssemblySymbol } from '../../parsers';
import { SymbolManager } from '../../managers';

describe('SymbolManager', () => {
  it('should create', () => {
    const manager = new SymbolManager();
    expect(manager.implementations.length).toBe(0);
    expect(manager.references.length).toBe(0);
  });

  it('should add implementation', () => {
    const manager = new SymbolManager();
    const token = new Token('foo', 0, 3, TokenKind.label, TokenType.label, true, true);
    const symbol = new AssemblySymbol(token, vscode.Uri.file('foo'), 0, 0);
    manager.addImplementation(symbol);
    expect(manager.implementations.length).toBe(1);
    expect(manager.implementations[0]).toBe(symbol);
  });

  it('should add reference', () => {
    const manager = new SymbolManager();
    const token = new Token('foo', 0, 3, TokenKind.label, TokenType.label, true, true);
    const symbol = new AssemblySymbol(token, vscode.Uri.file('foo'), 0, 0);
    manager.addReference(symbol);
    expect(manager.references.length).toBe(1);
    expect(manager.references[0]).toBe(symbol);
  });

  it('should clear', () => {
    const uri = vscode.Uri.file('foo');
    const manager = new SymbolManager();
    const token = new Token('foo', 0, 3, TokenKind.label, TokenType.label, true, true);
    const symbol = new AssemblySymbol(token, uri, 0, 0);
    manager.addImplementation(symbol);
    manager.addReference(symbol);

    manager.clearDocument(uri);

    expect(manager.implementations.length).toBe(0);
    expect(manager.references.length).toBe(0);
  });

  it('should dispose', () => {
    const uri = vscode.Uri.file('foo');
    const manager = new SymbolManager();
    const token = new Token('foo', 0, 3, TokenKind.label, TokenType.label, true, true);
    const symbol = new AssemblySymbol(token, uri, 0, 0);
    manager.addImplementation(symbol);
    manager.addReference(symbol);

    manager.dispose();

    expect(manager.implementations.length).toBe(0);
    expect(manager.references.length).toBe(0);
  });
});
