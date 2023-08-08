import * as vscode from 'vscode';

import { isTextDocument  } from '../common';
import { ASM6X09_FILE_GLOB_PATTERN, ASM6X09_LANGUAGE } from '../constants';
import { Folder } from './folder';
import { AssemblyDocument, Docs } from '../parsers';
import { SymbolManager } from './symbol';

export class WorkspaceManager implements vscode.Disposable {

  private static readonly noWorkspaceUri = 'wsf:none';
  private isDisposed: boolean = false;
  public readonly docs: Docs;

  private folders: Map<string, Folder> = new Map<string, Folder>();
  private disposables: vscode.Disposable[] = [];

  constructor(extensionPath: string) {
    this.docs = new Docs(extensionPath);
  }

  public async init(): Promise<void> {
    // Load the docs from the extension path
    await this.docs.init();

    // Add the workspace folders if there are any
    vscode.workspace.workspaceFolders?.forEach(wf => this.addFolder(wf));
    vscode.workspace.findFiles(ASM6X09_FILE_GLOB_PATTERN).then(files => {
      files.forEach(file => {
        this.addDocument(file);
      });
    });

    // Add the workspace folder listeners
    this.disposables.push(
      vscode.workspace.onDidChangeWorkspaceFolders(change => {
        change.added.forEach(folder => this.addFolder(folder));
        change.removed.forEach(folder => this.removeFolder(folder));
      }));
    this.disposables.push(
      vscode.workspace.onDidOpenTextDocument(document => {
        this.addDocument(document);
      }));
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument(change => {
        if (change.contentChanges.length > 0) {
          this.updateDocument(change);
        }
      }));
    this.disposables.push(
      vscode.workspace.onDidCloseTextDocument(document => {
        this.removeDocument(document);
      }));
    this.disposables.push(
      vscode.workspace.onDidCreateFiles(event => {
        event.files.forEach(file => {
          const document = vscode.workspace.textDocuments
            .find(d => d.uri.toString() === file.toString());
          if (document) {
            this.addDocument(document);
          }
        });
      }));
    this.disposables.push(
      vscode.workspace.onDidDeleteFiles(event => {
        event.files.forEach(file => {
          const document = vscode.workspace.textDocuments
            .find(d => d.uri.toString() === file.toString());
          if (document) {
            this.removeDocument(document);
          }
        });
      }));
    this.disposables.push(
      vscode.workspace.onDidRenameFiles(event => {
        event.files.forEach(file => {
          const document = vscode.workspace.textDocuments
            .find(d => d.uri.toString() === file.oldUri.toString());
          if (document) {
            this.removeDocument(document);
          }
        });
        event.files.forEach(file => {
          const document = vscode.workspace.textDocuments
            .find(d => d.uri.toString() === file.newUri.toString());
          if (document) {
            this.addDocument(document);
          }
        });
      }));
  }

  public dispose(): void {
    if (!this.isDisposed) {
      this.folders.forEach(f => f.dispose());
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
    await folder.add(document, token);
  }

  public getAssemblyDocument(
    document: vscode.TextDocument | vscode.Uri,
    token?: vscode.CancellationToken): AssemblyDocument | undefined {

    const uri = isTextDocument(document) ? document.uri : document;
    const folder = this.getOrCreateFolder(uri);
    
    if (folder.contains(uri)) {
      return folder.get(uri);
    }

    folder.add(document, token);
    return folder.get(uri);
  }

  public updateDocument(change: vscode.TextDocumentChangeEvent): void {
    const document = change.document;
    
    if (isTextDocument(document) && document.languageId !== ASM6X09_LANGUAGE) {
      return;
    }

    const uri = document.uri;
    const folder = this.getOrCreateFolder(uri);
    folder.update(document);
  }

  public removeDocument(document: vscode.TextDocument |  vscode.Uri): void {
    if (isTextDocument(document) && document.languageId !== ASM6X09_LANGUAGE) {
      return;
    }

    const folder = this.getOrCreateFolder(document);
    folder.remove(document);
  }

  public addFolder(workspaceFolder: vscode.WorkspaceFolder): Folder {
    const folder = new Folder(workspaceFolder);
    this.folders.set(workspaceFolder.uri.toString(), folder);
    return folder;
  }

  public removeFolder(workspaceFolder: vscode.WorkspaceFolder): void {
    const folder = this.folders.get(workspaceFolder.uri.toString());

    if (folder) {
      folder.dispose();
      this.folders.delete(workspaceFolder.uri.toString());
    }
  }

  public getSymbolManager(document: vscode.TextDocument | vscode.Uri): SymbolManager {
    const folder = this.getOrCreateFolder(document);

    if (!folder.contains(document)) {
      folder.add(document);
    }

    return folder.symbolManager;
  }

  public getAllSymbolManagers(): SymbolManager[] {
    return [...this.folders.values()].map(f => f.symbolManager);
  }

  private getOrCreateFolder(document: vscode.TextDocument | vscode.Uri): Folder {
    const uri = isTextDocument(document) ? document.uri : document;
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    const folderUri = workspaceFolder
      ? workspaceFolder.uri
      : vscode.Uri.parse(WorkspaceManager.noWorkspaceUri);

    if (!this.folders.has(folderUri.toString())) {
      const folder = new Folder(workspaceFolder);
      this.folders.set(folderUri.toString(), folder);
      return folder; 
    }

    return this.folders.get(folderUri.toString())!;
  }
}
