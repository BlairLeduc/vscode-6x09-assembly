import { Disposable, Uri } from 'vscode';
import { AssemblyToken } from '../common';

export class SymbolManager implements Disposable {
  public tokens = new Array<AssemblyToken>();

  public dispose(): void {
    //TODO
  }

  public clearDocument(uri: Uri): void {
    this.tokens = this.tokens.filter(t => t.uri !== uri);
  }

  public addToken(token: AssemblyToken): void {
    this.tokens.push(token);
  }
}
