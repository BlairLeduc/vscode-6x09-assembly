import * as vscode from 'vscode';
import { Collection } from '../collection';
import { AssemblyDocument } from '../parsers/assembly-document';
import { Docs } from '../parsers/docs';

export class Folder {
  public documents: Collection<AssemblyDocument> = new Collection<AssemblyDocument>();

  constructor(public uri?: vscode.Uri) {
  }

  public containsAssemblyDocument(document: vscode.TextDocument): boolean {
    return this.documents.containsKey(document.uri);
  }
  public addAssemblyDocument(document: vscode.TextDocument, token: vscode.CancellationToken): AssemblyDocument {
    return this.documents.add(document.uri, new AssemblyDocument(document, undefined, token));
  }

  public getAssemblyDocument(document: vscode.TextDocument): AssemblyDocument {
    return this.documents.get(document.uri);
  }

  public updateAssemblyDocument(document: vscode.TextDocument, _?: readonly vscode.TextDocumentContentChangeEvent[]): AssemblyDocument {
    // Optimisation potential: look at what changed in document instead of re-parsing the whole thing
    return this.documents.add(document.uri, new AssemblyDocument(document));
  }

  public removeAssemblyDocument(document: vscode.TextDocument): void {
    this.documents.remove(document.uri);
  }
}

export class WorkspaceManager implements vscode.Disposable {
  private static readonly NoWorkspaceUri = 'wsf:none';
  public readonly opcodeDocs: Docs;

  private folders: Collection<Folder> = new Collection<Folder>();

  constructor(extensionPath: string) {
    this.opcodeDocs = new Docs(extensionPath);
  }

  public dispose(): void {
    // Nothing to dispose
  }

  public addDocument(document: vscode.TextDocument, token: vscode.CancellationToken): void {
    const folder = this.getOrCreateFolder(document);
    folder.addAssemblyDocument(document, token);
  }

  public getAssemblyDocument(document: vscode.TextDocument, token: vscode.CancellationToken): AssemblyDocument {
    const folder = this.getOrCreateFolder(document);
    if (folder.containsAssemblyDocument(document)) {
      return folder.getAssemblyDocument(document);
    }
    return folder.addAssemblyDocument(document, token);
  }

  public updateDocument(change: vscode.TextDocumentChangeEvent): void {
    const folder = this.getOrCreateFolder(change.document);
    folder.updateAssemblyDocument(change.document);
  }

  public removeDocument(document: vscode.TextDocument): void {
    const folder = this.getOrCreateFolder(document);
    folder.removeAssemblyDocument(document);
  }

  public addFolder(workspaceFolder: vscode.WorkspaceFolder): Folder {
    return this.folders.add(workspaceFolder.uri, new Folder(workspaceFolder.uri));
  }

  public removeFolder(workspaceFolder: vscode.WorkspaceFolder): void {
    this.folders.remove(workspaceFolder.uri);
  }

  private getOrCreateFolder(document: vscode.TextDocument): Folder {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    const uri = workspaceFolder ? workspaceFolder.uri : vscode.Uri.parse(WorkspaceManager.NoWorkspaceUri);

    if (!this.folders.containsKey(uri)) {
      return this.folders.add(uri, new Folder(uri));
    }
    return this.folders.get(uri);
  }
}
