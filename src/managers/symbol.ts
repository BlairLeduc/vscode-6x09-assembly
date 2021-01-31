import { Disposable, Uri } from 'vscode';
import { AssemblySymbol } from '../common';

export class SymbolManager implements Disposable {
  public symbols = new Array<AssemblySymbol>();

  public dispose(): void {
    //TODO
  }

  public clearDocument(uri: Uri): void {
    this.symbols = this.symbols.filter(t => t.uri !== uri);
  }

  public addSymbol(symbol: AssemblySymbol): void {
    this.symbols.push(symbol);
  }
}
