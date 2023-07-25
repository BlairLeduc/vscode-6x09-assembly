import * as vscode from 'vscode';
import { Collection } from './collections';
import { AssemblyDocument } from './parsers';
import { SymbolManager } from './managers';
import { isTextDocument } from './common';
import { Logger } from './logger';

// Represents a workspace folder
export class Folder implements vscode.Disposable {
  private isDisposed: boolean = false;
  public readonly symbolManager: SymbolManager;
  public readonly documents: Collection<AssemblyDocument> = new Collection<AssemblyDocument>();

  constructor(public workspaceFolder?: vscode.WorkspaceFolder) {
    this.symbolManager = new SymbolManager();
    if (this.workspaceFolder) {
      Logger.info(`Watching folder "${this.workspaceFolder?.name ?? "{}"}"`);
    }
  }

  dispose(): void {
    if (!this.isDisposed) {
      this.symbolManager.dispose();
      this.isDisposed = true;
    }
  }

  public containsAssemblyDocument(document: vscode.TextDocument | vscode.Uri): boolean {
    const uri = isTextDocument(document) ? document.uri : document;
    return this.documents.containsKey(uri);
  }

  public async addAssemblyDocument(
    document: vscode.TextDocument | vscode.Uri,
    token?: vscode.CancellationToken): Promise<void> {

    if (!this.containsAssemblyDocument(document)) {
      await this.updateAssemblyDocument(document, token);
    }
  }

  public async updateAssemblyDocument(
    document: vscode.TextDocument | vscode.Uri,
    token?: vscode.CancellationToken): Promise<void> {

    const uri = isTextDocument(document) ? document.uri : document;

    const assemblyDocument = await AssemblyDocument.create(document, this.symbolManager, token);
    if (assemblyDocument) {
      let updateReferences = true; // By default, update references
      
      if (this.containsAssemblyDocument(uri)) {
        // If the document already exists, check if the references have changed
        const oldReferences = this.documents
          .get(uri)
          .referencedDocuments
          .map(d => d.uri.toString())
          .reduce((a, b) => a.concat(b), '');

        const newReferences = assemblyDocument
          .referencedDocuments
          .map(d => d.uri.toString())
          .reduce((a, b) => a.concat(b), '');

        if (oldReferences === newReferences) {
          updateReferences = false;
          Logger.debug("Not updating references because they haven't changed");
        }
      } else {
        // Log that we're watching the document
        const workspace = this.workspaceFolder ? ` in workspace "${this.workspaceFolder.name}"` : '';
        Logger.info(`Watching ${uri.toString()}${workspace}`);
      }

      this.documents.add(uri, assemblyDocument);

      if (updateReferences) {
        for (const referencedDocument of assemblyDocument.referencedDocuments) {
          if (!this.documents.containsKey(referencedDocument.uri)) {
            Logger.debug(`Scanning referenced document ${referencedDocument.uri.toString()}`);
            await this.addAssemblyDocument(referencedDocument.uri, token);
          }
        }
      }
    }
  }

  public getAssemblyDocument(uri: vscode.Uri): AssemblyDocument | undefined {
    return this.containsAssemblyDocument(uri) ? this.documents.get(uri) : undefined;
  }

  public removeAssemblyDocument(document: vscode.TextDocument | vscode.Uri): void {
    const uri = isTextDocument(document) ? document.uri : document;
    this.documents.remove(uri);

    const workspace = this.workspaceFolder ? ` in workspace "${this.workspaceFolder.name}"` : '';
    Logger.info(`Stopped monitoring ${uri.toString()}${workspace}`);
  }
}
