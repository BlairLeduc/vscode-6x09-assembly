import { CompletionItemKind, Disposable, Uri } from 'vscode';
import { AssemblySymbol, AssemblyToken } from '../common';


export class SymbolManager implements Disposable {
  public definitions = new Array<AssemblySymbol>();
  public references = new Array<AssemblySymbol>();

  public dispose(): void {
    //TODO
  }

  public clearDocument(uri: Uri): void {
    this.definitions = this.definitions.filter(d => d.uri !== uri);
    this.references = this.references.filter(r => r.uri !== uri);
  }

  public addDefinition(symbol: AssemblySymbol): AssemblySymbol {
    this.definitions.push(symbol);
    return symbol;
  }

  public addDefinitionFromToken(token: AssemblyToken, documentation: string, uri: Uri): void {
    this.definitions.push(new AssemblySymbol(token.text, token.range, documentation, token.kind, token.lineRange, uri, token.value));
    token.children.forEach(ref => {
      this.references.push(new AssemblySymbol(ref.text, ref.range, documentation, ref.kind, ref.lineRange, uri, token.value))
    });
  }

  public addReference(symbol: AssemblySymbol): AssemblySymbol {
    this.references.push(symbol);
    return symbol;
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

  public findReferencesByName(name: string, includeLabel: boolean): AssemblySymbol[] {
    const symbols = this.references.filter(r => r.name === name);
    if (includeLabel) {
      this.definitions.filter(d => d.name === name).forEach(d => symbols.push(d));
    }
    return symbols;
  }
}