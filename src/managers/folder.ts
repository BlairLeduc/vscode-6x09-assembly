import * as vscode from 'vscode';

import { AssemblyDocument } from '../parsers';
import { SymbolManager } from '.';
import { isTextDocument } from '../common';
import { Logger } from '../logger';

// Represents a workspace folder
export class Folder implements vscode.Disposable {
  private isDisposed: boolean = false;
  public readonly symbolManager: SymbolManager;
  public readonly documents: Map<string, AssemblyDocument> = new Map<string, AssemblyDocument>();

  constructor(public workspaceFolder?: vscode.WorkspaceFolder) {
    this.symbolManager = new SymbolManager();
    if (this.workspaceFolder) {
      Logger.info(`Watching folder "${this.workspaceFolder.name}"`);
    }
  }

  dispose(): void {
    if (!this.isDisposed) {
      this.symbolManager.dispose();
      this.isDisposed = true;
    }
  }

  public contains(document: vscode.TextDocument | vscode.Uri): boolean {
    const uri = isTextDocument(document) ? document.uri : document;
    return this.documents.has(uri.toString());
  }

  public async add(
    document: vscode.TextDocument | vscode.Uri,
    token?: vscode.CancellationToken): Promise<void> {

    if (!this.contains(document)) {
      await this.update(document, token);
    }
  }

  public async update(
    document: vscode.TextDocument | vscode.Uri,
    token?: vscode.CancellationToken): Promise<void> {

    const uri = isTextDocument(document) ? document.uri : document;

    const assemblyDocument = await AssemblyDocument.create(document, this.symbolManager, token);
    if (assemblyDocument) {
      let updateReferences = assemblyDocument.referencedDocuments.length > 0;
      
      const original = this.documents.get(uri.toString());
      if (original) {
        // If the document already exists, check if the references have changed
        const oldReferences = original
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
        const workspace = this.workspaceFolder
          ? ` in workspace "${this.workspaceFolder.name}"`
          : '';
        Logger.info(`Watching ${uri.toString()}${workspace}`);
      }

      this.documents.set(uri.toString(), assemblyDocument);

      if (updateReferences) {
        for (const referencedDocument of assemblyDocument.referencedDocuments) {
          if (!this.documents.has(referencedDocument.uri.toString())) {
            Logger.debug(`Scanning referenced document ${referencedDocument.uri.toString()}`);
            await this.add(referencedDocument.uri, token);
          }
        }
      }
    }
    return;
  }

  public get(uri: vscode.Uri): AssemblyDocument | undefined {
    return this.contains(uri) ? this.documents.get(uri.toString()) : undefined;
  }

  public remove(document: vscode.TextDocument | vscode.Uri): void {
    const uri = isTextDocument(document) ? document.uri : document;
    this.documents.delete(uri.toString());

    const workspace = this.workspaceFolder ? ` in workspace "${this.workspaceFolder.name}"` : '';
    Logger.info(`Stopped monitoring ${uri.toString()}${workspace}`);
  }
}
