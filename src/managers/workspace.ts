import * as vscode from 'vscode';
import { Collection } from '../collection';
import { AssemblyDocument } from '../parsers/assembly-document';
import { Docs } from '../parsers/docs';
import { SymbolManager } from './symbol';
import { Folder } from './Folder';

export class WorkspaceManager implements vscode.Disposable {
  private static readonly noWorkspaceUri = 'wsf:none';
  private isDisposed: boolean = false;
  public readonly opcodeDocs: Docs;

  private folders: Collection<Folder> = new Collection<Folder>();
  private disposables: Array<vscode.Disposable> = new Array<vscode.Disposable>();

  constructor(extensionPath: string) {
    this.opcodeDocs = new Docs(extensionPath);

    // Add the workspace folders if there are any
    vscode.workspace.workspaceFolders?.forEach(wf => this.addFolder(wf));

    // Add the workspace folder listeners
    this.disposables.push(vscode.workspace.onDidChangeWorkspaceFolders(change => {
      change.added.forEach(folder => this.addFolder(folder));
      change.removed.forEach(folder => this.removeFolder(folder));
    }));
    this.disposables.push(vscode.workspace.onDidOpenTextDocument(document => {
      this.addDocument(document);
    }));
    this.disposables.push(vscode.workspace.onDidChangeTextDocument(change => {
      this.updateDocument(change);
    }));
    this.disposables.push(vscode.workspace.onDidCloseTextDocument(document => {
      this.removeDocument(document);
    }));
    this.disposables.push(vscode.workspace.onDidCreateFiles(event => {
      event.files.forEach(file => {
        const document = vscode.workspace.textDocuments.find(d => d.uri.fsPath === file.fsPath);
        if (document) {
          this.addDocument(document);
        }
      });
    }));
    this.disposables.push(vscode.workspace.onDidDeleteFiles(event => {
      event.files.forEach(file => {
        const document = vscode.workspace.textDocuments.find(d => d.uri.fsPath === file.fsPath);
        if (document) {
          this.removeDocument(document);
        }
      });
    }));
    this.disposables.push(vscode.workspace.onDidRenameFiles(event => {
      event.files.forEach(file => {
        const document = vscode.workspace.textDocuments.find(d => d.uri.fsPath === file.oldUri.fsPath);
        if (document) {
          this.removeDocument(document);
        }
      });
      event.files.forEach(file => {
        const document = vscode.workspace.textDocuments.find(d => d.uri.fsPath === file.newUri.fsPath);
        if (document) {
          this.addDocument(document);
        }
      });
    }));
  }

  public dispose(): void {
    if (!this.isDisposed) {
      this.folders.values().forEach(f => f.dispose());
      this.folders.clear();
      this.disposables.forEach(d => d.dispose());
      this.disposables = [];
      this.isDisposed = true;
    }
  }

  public addDocument(document: vscode.TextDocument, token?: vscode.CancellationToken): void {
    const folder = this.getOrCreateFolder(document);
    folder.addAssemblyDocument(document, token);
  }

  public getAssemblyDocument(document: vscode.TextDocument, token?: vscode.CancellationToken): AssemblyDocument | undefined {
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

    return this.folders.add(workspaceFolder.uri, new Folder(workspaceFolder));
  }

  public removeFolder(workspaceFolder: vscode.WorkspaceFolder): void {
    this.folders.get(workspaceFolder.uri).dispose();
    this.folders.remove(workspaceFolder.uri);
  }

  public getSymbolManager(document: vscode.TextDocument): SymbolManager {
    const folder = this.getOrCreateFolder(document);

    if (!folder.containsAssemblyDocument(document)) {
      folder.addAssemblyDocument(document);
    }
    return folder.symbolManager;
  }

  public getAllSymbolManagers(): SymbolManager[] {
    return this.folders.values().map(f => f.symbolManager);
  }

  private getOrCreateFolder(document: vscode.TextDocument): Folder {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    const uri = workspaceFolder ? workspaceFolder.uri : vscode.Uri.parse(WorkspaceManager.noWorkspaceUri);

    if (!this.folders.containsKey(uri)) {
      return this.folders.add(uri, new Folder(workspaceFolder));
    }
    return this.folders.get(uri);
  }
}
