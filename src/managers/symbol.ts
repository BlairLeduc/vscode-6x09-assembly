import * as vscode from 'vscode';
import { AssemblySymbol } from '../common';

export interface AssemblyReference {
  from: AssemblySymbol;
  definition: AssemblySymbol;
}

export class SymbolManager implements vscode.Disposable {
  public definitions = new Array<AssemblySymbol>();
  public references = new Array<AssemblySymbol>();

  public dispose(): void {
    //TODO
  }

  public clearDocument(uri: vscode.Uri): void {
    this.definitions = this.definitions.filter(d => d.uri !== uri);
    this.references = this.references.filter(r => r.uri !== uri);
  }

  public addDefinition(symbol: AssemblySymbol): AssemblySymbol {
    this.definitions.push(symbol);
    return symbol;
  }

  public addReference(symbol: AssemblySymbol): AssemblySymbol {
    this.references.push(symbol);
    return symbol;
  }

  public findLabel(startsWith: string): AssemblySymbol[] {
    return this.definitions.filter(d => d.kind === vscode.CompletionItemKind.Method && d.name.startsWith(startsWith));
  }

  public findMacro(startsWith: string): AssemblySymbol[] {
    return this.definitions.filter(d => d.kind === vscode.CompletionItemKind.Function && d.name.startsWith(startsWith));
  }

  public getMacro(name: string): AssemblySymbol {
    return this.definitions.find(d => d.kind === vscode.CompletionItemKind.Function && d.name === name);
  }

  public findDefinitionsByName(name: string): AssemblySymbol[] {
    return this.definitions.filter(s => s.name === name);
  }

  public findDefinitionsInDocument(uri: vscode.Uri): AssemblySymbol[] {
    return this.definitions.filter(d => d.uri === uri);
  }

  public findReferencesByName(name: string, includeLabel: boolean): AssemblySymbol[] {
    const symbols = this.references.filter(r => r.name === name);
    if (includeLabel) {
      this.definitions.filter(d => d.name === name).forEach(d => symbols.push(d));
    }
    return symbols;
  }

  public symbolsEqual(a: AssemblySymbol, b: AssemblySymbol): boolean {
    return a.kind === b.kind
      && a.name === b.name
      && a.uri === b.uri;
  }
}