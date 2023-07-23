import * as vscode from 'vscode';
import { AssemblySymbol, TokenKind } from '../common';
import { LineParser } from '../parsers/line-parser';

export class SymbolManager implements vscode.Disposable {
  public implementations = new Array<AssemblySymbol>();
  public references = new Array<AssemblySymbol>();

  public dispose(): void {
    //TODO
  }

  public clearDocument(uri: vscode.Uri): void {
    this.implementations = this.implementations.filter(t => t.uri.fsPath !== uri.fsPath);
    this.references = this.references.filter(t => t.uri.fsPath !== uri.fsPath);
  }

  public addImplementation(symbol: AssemblySymbol): void {
    this.implementations.push(symbol);
  }

  public addReference(symbol: AssemblySymbol): void {
    this.references.push(symbol);
  }
}
