import * as vscode from 'vscode';
import { Collection } from '../collection';
import { AssemblyDocument } from '../parsers/assembly-document';
import { SymbolManager } from './symbol';

// Represents a workspace folder
export class Folder implements vscode.Disposable {
  private isDisposed: boolean = false;
  public readonly symbolManager: SymbolManager;
  public readonly documents: Collection<AssemblyDocument> = new Collection<AssemblyDocument>();

  constructor(public workspaceFolder?: vscode.WorkspaceFolder) {
    this.symbolManager = new SymbolManager();
  }

  dispose(): void {
    if (!this.isDisposed) {
      this.symbolManager.dispose();
      this.isDisposed = true;
    }
  }

  public containsAssemblyDocument(document: vscode.TextDocument): boolean {
    return this.documents.containsKey(document.uri);
  }

  public addAssemblyDocument(document: vscode.TextDocument, token?: vscode.CancellationToken): AssemblyDocument {
    const assemblyDocument = this.documents.add(document.uri, new AssemblyDocument(this.symbolManager, document, undefined, token));
    return assemblyDocument;
  }

  public getAssemblyDocument(document: vscode.TextDocument): AssemblyDocument | undefined {
    return this.containsAssemblyDocument(document) ? this.documents.get(document.uri) : undefined;
  }

  public updateAssemblyDocument(document: vscode.TextDocument, _?: readonly vscode.TextDocumentContentChangeEvent[]): AssemblyDocument {
    // Optimisation potential: look at what changed in document instead of re-parsing the whole thing
    const assemblyDocument = this.documents.add(document.uri, new AssemblyDocument(this.symbolManager, document));
    return assemblyDocument;
  }

  public removeAssemblyDocument(document: vscode.TextDocument): void {
    this.documents.remove(document.uri);
  }
}
