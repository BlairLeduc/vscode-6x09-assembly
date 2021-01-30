import { Disposable, Uri } from 'vscode';
import { AssemblySymbol } from '../common';

export class SymbolManager implements Disposable {
  public tokens = new Array<AssemblySymbol>();

  public dispose(): void {
    //TODO
  }

  public clearDocument(uri: Uri): void {
    this.tokens = this.tokens.filter(t => t.uri !== uri);
  }

  public addToken(token: AssemblySymbol): void {
    this.tokens.push(token);
  }
}
