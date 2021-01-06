import { Disposable, Uri } from 'vscode';
import { AssemblySymbol, AssemblyToken } from '../common';

export class SymbolManager implements Disposable {
  public definitions = new Array<AssemblySymbol>();
  public references = new Array<AssemblySymbol>();
  public tokens = new Array<AssemblyToken>();

  public dispose(): void {
    //TODO
  }

  public clearDocument(uri: Uri): void {
    this.definitions = this.definitions.filter(d => d.uri !== uri);
    this.references = this.references.filter(r => r.uri !== uri);
    this.tokens = this.tokens.filter(t => t.uri !== uri);
  }

  public addToken(token: AssemblyToken): void {
    this.tokens.push(token);
  }
}
