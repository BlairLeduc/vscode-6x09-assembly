import * as vscode from 'vscode';
import { Collection } from './collection';
import { AssemblyDocument } from './parsers/assembly-document';
import { SymbolManager } from './managers/symbol';
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
      Logger.info(`Monitoring folder "${this.workspaceFolder?.name ?? "{}"}"`);
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
    token?: vscode.CancellationToken): Promise<vscode.Uri[]> {

    if (this.containsAssemblyDocument(document)) {
      return [];
    }

    const uri = isTextDocument(document) ? document.uri : document;
    const workspace = this.workspaceFolder ? ` in workspace "${this.workspaceFolder.name}"` : '';
    Logger.info(`Monitoring ${uri.toString()}${workspace}`);

    return await this.updateAssemblyDocument(document, token);
  }

  public async updateAssemblyDocument(
    document: vscode.TextDocument | vscode.Uri,
    token?: vscode.CancellationToken): Promise<vscode.Uri[]> {

    const uri = isTextDocument(document) ? document.uri : document;

    const assemblyDocument = this.documents
      .add(uri, await AssemblyDocument.create(document, this.symbolManager, token));

    const processedDocuments = new Set<vscode.Uri>();
    processedDocuments.add(uri);
    assemblyDocument.referencedDocuments.forEach(d => {
      processedDocuments.add(d.uri);
    });

    for (const referencedDocument of assemblyDocument.referencedDocuments) {
      if (!processedDocuments.has(referencedDocument.uri)) {
        (await this.addAssemblyDocument(referencedDocument.uri, token)).forEach(d => {
          processedDocuments.add(d);
        });
        processedDocuments.add(referencedDocument.uri);
      }
    }
    return Array.from(processedDocuments.values());
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
