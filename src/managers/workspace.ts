import * as vscode from 'vscode';
import { Collection } from '../collection';
import { AssemblyDocument } from '../parsers/assembly-document';
import { Docs } from '../parsers/docs';
import { SymbolManager } from './symbol';
import { Folder } from '../folder';
import { ASM6X09_FILE_GLOB_PATTERN, ASM6X09_LANGUAGE, isTextDocument } from '../common';

export class WorkspaceManager implements vscode.Disposable {
  private static readonly noWorkspaceUri = 'wsf:none';
  private isDisposed: boolean = false;
  public readonly opcodeDocs: Docs;

  private folders: Collection<Folder> = new Collection<Folder>();
  private disposables: Array<vscode.Disposable>;

  constructor(extensionPath: string) {
    this.opcodeDocs = new Docs(extensionPath);

    // Add the workspace folders if there are any
    vscode.workspace.workspaceFolders?.forEach(wf => this.addFolder(wf));
    vscode.workspace.findFiles(ASM6X09_FILE_GLOB_PATTERN).then(files => {
      files.forEach(file => {
        this.addDocument(file);
      });
    });

    // Add the workspace folder listeners
    this.disposables = [
      vscode.workspace.onDidChangeWorkspaceFolders(change => {
        change.added.forEach(folder => this.addFolder(folder));
        change.removed.forEach(folder => this.removeFolder(folder));
      }),
      vscode.workspace.onDidOpenTextDocument(document => {
        this.addDocument(document);
      }),
      vscode.workspace.onDidChangeTextDocument(change => {
        this.updateDocument(change);
      }),
      vscode.workspace.onDidCloseTextDocument(document => {
        this.removeDocument(document);
      }),
      vscode.workspace.onDidCreateFiles(event => {
        event.files.forEach(file => {
          const document = vscode.workspace.textDocuments.find(d => d.uri.fsPath === file.fsPath);
          if (document) {
            this.addDocument(document);
          }
        });
      }),
      vscode.workspace.onDidDeleteFiles(event => {
        event.files.forEach(file => {
          const document = vscode.workspace.textDocuments.find(d => d.uri.fsPath === file.fsPath);
          if (document) {
            this.removeDocument(document);
          }
        });
      }),
      vscode.workspace.onDidRenameFiles(event => {
        event.files.forEach(file => {
          const document = vscode.workspace
            .textDocuments
            .find(d => d.uri.fsPath === file.oldUri.fsPath);
          if (document) {
            this.removeDocument(document);
          }
        });
        event.files.forEach(file => {
          const document = vscode.workspace
            .textDocuments
            .find(d => d.uri.fsPath === file.newUri.fsPath);
          if (document) {
            this.addDocument(document);
          }
        });
      }),
    ];
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

  public async addDocument(
    document: vscode.TextDocument | vscode.Uri,
    token?: vscode.CancellationToken): Promise<void> {
    if (isTextDocument(document) && document.languageId !== ASM6X09_LANGUAGE) {
      return;
    }
    const folder = this.getOrCreateFolder(document);
    await folder.addAssemblyDocument(document, token);
  }

  public getAssemblyDocument(
    document: vscode.TextDocument | vscode.Uri,
    token?: vscode.CancellationToken): AssemblyDocument | undefined {
    const uri = isTextDocument(document) ? document.uri : document;
    const folder = this.getOrCreateFolder(uri);
    if (folder.containsAssemblyDocument(uri)) {
      return folder.getAssemblyDocument(uri);
    }
    folder.addAssemblyDocument(document, token);
    return folder.getAssemblyDocument(uri);
  }

  public updateDocument(change: vscode.TextDocumentChangeEvent): void {
    const document = change.document;
    const uri = document.uri;
    const folder = this.getOrCreateFolder(uri);
    folder.addAssemblyDocument(document);
  }

  public removeDocument(document: vscode.TextDocument |  vscode.Uri): void {
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

  public getSymbolManager(document: vscode.TextDocument | vscode.Uri): SymbolManager {
    const folder = this.getOrCreateFolder(document);

    if (!folder.containsAssemblyDocument(document)) {
      folder.addAssemblyDocument(document);
    }
    return folder.symbolManager;
  }

  public getAllSymbolManagers(): SymbolManager[] {
    return this.folders.values().map(f => f.symbolManager);
  }

  private getOrCreateFolder(document: vscode.TextDocument | vscode.Uri): Folder {
    const uri = isTextDocument(document) ? document.uri : document;
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    const folderUri = workspaceFolder
      ? workspaceFolder.uri
      : vscode.Uri.parse(WorkspaceManager.noWorkspaceUri);

    if (!this.folders.containsKey(folderUri)) {
      return this.folders.add(folderUri, new Folder(workspaceFolder));
    }
    return this.folders.get(folderUri);
  }
}
