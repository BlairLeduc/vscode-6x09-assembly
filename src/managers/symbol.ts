import * as vscode from 'vscode';

import { AssemblySymbol } from '../parsers';

export class SymbolManager implements vscode.Disposable {
  public implementations: AssemblySymbol[] = [];
  public references: AssemblySymbol[] = [];

  public dispose(): void {
    //TODO
  }

  public clearDocument(uri: vscode.Uri): void {
    this.implementations = this.implementations.filter(t => t.uri.toString() !== uri.toString());
    this.references = this.references.filter(t => t.uri.toString() !== uri.toString());
  }

  public addImplementation(symbol: AssemblySymbol): void {
    this.implementations.push(symbol);
  }

  public addReference(symbol: AssemblySymbol): void {
    this.references.push(symbol);
  }
}
