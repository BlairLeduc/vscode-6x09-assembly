import * as vscode from 'vscode';
import { AssemblyDocument } from '../parsers/assembly-document';
import { Docs } from '../parsers/docs';
import { Collection } from './collection';
import { AssemblyFolder } from './folder';

export class WorkspaceManager implements vscode.Disposable {
  private static readonly NoWorkspaceUri = 'wsf:none';
  public readonly opcodeDocs: Docs;

  private folders: Collection<AssemblyFolder> = new Collection<AssemblyFolder>();

  constructor(extensionPath: string) {
    this.opcodeDocs = new Docs(extensionPath);
  }

  public dispose(): void {
    // Nothing to dispose
  }

  public addDocument(document: vscode.TextDocument): void {
    const folder = this.getOrCreateFolder(document);
    folder.addAssemblyDocument(document);
  }

  public getAssemblyDocument(document: vscode.TextDocument): AssemblyDocument {
    const folder = this.getOrCreateFolder(document);
    if (folder.containsAssemblyDocument(document)) {
      return folder.getAssemblyDocument(document);
    }
    return folder.addAssemblyDocument(document);
  }

  public updateDocument(change: vscode.TextDocumentChangeEvent): void {
    const folder = this.getOrCreateFolder(change.document);
    folder.updateAssemblyDocument(change.document, change.contentChanges);
  }

  public removeDocument(document: vscode.TextDocument): void {
    const folder = this.getOrCreateFolder(document);
    folder.removeAssemblyDocument(document);
  }

  public addFolder(workspaceFolder: vscode.WorkspaceFolder): AssemblyFolder {
    return this.folders.add(workspaceFolder.uri, new AssemblyFolder(workspaceFolder.uri));
  }

  public removeFolder(workspaceFolder: vscode.WorkspaceFolder): void {
    this.folders.remove(workspaceFolder.uri);
  }

  private getOrCreateFolder(document: vscode.TextDocument): AssemblyFolder {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    const uri = workspaceFolder ? workspaceFolder.uri : vscode.Uri.parse(WorkspaceManager.NoWorkspaceUri);

    if (!this.folders.containsKey(uri)) {
      return this.folders.add(uri, new AssemblyFolder(uri));
    }
    return this.folders.get(uri);
  }
}