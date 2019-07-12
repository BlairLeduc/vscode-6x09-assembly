import { TextDocument, TextDocumentChangeEvent, Uri, workspace, WorkspaceFolder } from 'vscode';
import { Collection } from './collection';
import { Docs } from './docs';
import { AssemblyFolder } from './folder';
import { AssemblyDocument } from './parser';

export class AssemblyWorkspaceManager {
  private static readonly NoWorkspaceUri = 'wsf:none';
  public readonly opcodeDocs: Docs;

  private folders: Collection<AssemblyFolder> = new Collection<AssemblyFolder>();

  constructor(extensionPath: string) {
    this.opcodeDocs = new Docs(extensionPath);
  }

  public addDocument(document: TextDocument): void {
    const folder = this.getOrCreateFolder(document);
    folder.addAssemblyDocument(document);
  }

  public getAssemblyDocument(document: TextDocument): AssemblyDocument {
    const folder = this.getOrCreateFolder(document);
    if (folder.containsAssemblyDocument(document)) {
      return folder.getAssemblyDocument(document);
    }
    return folder.addAssemblyDocument(document);
  }

  public updateDocument(change: TextDocumentChangeEvent): void {
    const folder = this.getOrCreateFolder(change.document);
    folder.updateAssemblyDocument(change.document, change.contentChanges);
  }

  public removeDocument(document: TextDocument): void {
    const folder = this.getOrCreateFolder(document);
    folder.removeAssemblyDocument(document);
  }

  public addFolder(workspaceFolder: WorkspaceFolder): AssemblyFolder {
    return this.folders.add(workspaceFolder.uri, new AssemblyFolder(workspaceFolder.uri));
  }

  public removeFolder(workspaceFolder: WorkspaceFolder): void {
    this.folders.remove(workspaceFolder.uri);
  }

  private getOrCreateFolder(document: TextDocument): AssemblyFolder {
    const workspaceFolder = workspace.getWorkspaceFolder(document.uri);
    const uri = workspaceFolder ? workspaceFolder.uri : Uri.parse(AssemblyWorkspaceManager.NoWorkspaceUri);

    if (!this.folders.containsKey(uri)) {
      return this.folders.add(uri, new AssemblyFolder(uri));
    }
    return this.folders.get(uri);
  }
}
