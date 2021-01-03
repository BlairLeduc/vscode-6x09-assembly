import { CompletionItemKind, Disposable, Uri } from 'vscode';
import { AssemblySymbol, AssemblyToken } from '../common';


class AssemblyTokenSymbol {
  constructor(public token: AssemblyToken, public uri: Uri) {}
}

export class SymbolManager implements Disposable {
  public definitions = new Array<AssemblySymbol>();
  public references = new Array<AssemblySymbol>();
  public tokens = new Array<AssemblyTokenSymbol>();

  public dispose(): void {
    //TODO
  }

  public clearDocument(uri: Uri): void {
    this.definitions = this.definitions.filter(d => d.uri !== uri);
    this.references = this.references.filter(r => r.uri !== uri);
    this.tokens = this.tokens.filter(t => t.uri !== uri);
  }

  public addDefinition(symbol: AssemblySymbol): AssemblySymbol {
    this.definitions.push(symbol);
    return symbol;
  }

  public addToken(token: AssemblyToken, uri: Uri): void {
    this.tokens.push(new AssemblyTokenSymbol(token, uri));
  }

  public addReference(symbol: AssemblySymbol): AssemblySymbol {
    this.references.push(symbol);
    return symbol;
  }

  public findLabelSymbol(startsWith: string): AssemblyTokenSymbol[] {
    return this.tokens.filter(t => (t.token.kind === CompletionItemKind.Class || t.token.kind === CompletionItemKind.Function) && t.token.text.startsWith(startsWith));
  }

  public findLabel(startsWith: string): AssemblySymbol[] {
    return this.definitions.filter(d => (d.kind === CompletionItemKind.Class ||  d.kind === CompletionItemKind.Function) && d.name.startsWith(startsWith));
  }

  public findMacro(startsWith: string): AssemblySymbol[] {
    return this.definitions.filter(d => d.kind === CompletionItemKind.Method && d.name.startsWith(startsWith));
  }

  public getMacro(name: string): AssemblySymbol {
    return this.definitions.find(d => d.kind === CompletionItemKind.Method && d.name === name);
  }

  public findDefinitionsByName(name: string): AssemblySymbol[] {
    return this.definitions.filter(s => s.name === name);
  }

  public findDefinitionsInDocument(uri: Uri): AssemblySymbol[] {
    return this.definitions.filter(d => d.uri === uri);
  }

  public findSymbolsInDocument(uri: Uri): AssemblyTokenSymbol[] {
    return this.tokens.filter(t => t.uri === uri);
  }

  public findReferencesByName(name: string, includeLabel: boolean): AssemblySymbol[] {
    const symbols = this.references.filter(r => r.name === name);
    if (includeLabel) {
      this.definitions.filter(d => d.name === name).forEach(d => symbols.push(d));
    }
    return symbols;
  }
}