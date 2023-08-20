import * as vscode from 'vscode';

import { isTextDocument } from '../common';
import { ASM6X09_FILE_GLOB_PATTERN, ASM6X09_LANGUAGE } from '../constants';
import { Folder } from './folder';
import { AssemblyDocument, Docs } from '../parsers';
import { SymbolManager } from './symbol';

export class WorkspaceManager implements vscode.Disposable {
  private defaultFolder: Folder = new Folder();
  private folders: Map<string, Folder> = new Map<string, Folder>();
  private disposables: vscode.Disposable[] = [];

  isDisposed: boolean = false;
  readonly docs: Docs;

  constructor(extensionPath: string) {
    this.docs = new Docs(extensionPath);
  }

  async init(): Promise<void> {
    // Load the docs from the extension path
    await this.docs.init();

    // Add the workspace folders, if there are any
    vscode.workspace.workspaceFolders?.forEach(wf => this.setFolder(wf));

    // Add the open documents that are assembly files
    const files = await vscode.workspace.findFiles(ASM6X09_FILE_GLOB_PATTERN);
    files.forEach(async file => {
      await this.loadDocument(file);
    });

    // Add the workspace folder listeners
    this.disposables.push(
      vscode.workspace.onDidChangeWorkspaceFolders(change => {
        change.added.forEach(folder => this.setFolder(folder));
        change.removed.forEach(folder => this.deleteFolder(folder));
      }));
    this.disposables.push(
      vscode.workspace.onDidOpenTextDocument(async document => {
        await this.setDocument(document);
      }));
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument(async change => {
        if (change.contentChanges.length > 0) {
          await this.updateDocument(change);
        }
      }));
    this.disposables.push(
      vscode.workspace.onDidCloseTextDocument(document => {
        this.deleteDocument(document);
      }));
    this.disposables.push(
      vscode.workspace.onDidCreateFiles(async event => {
        event.files.forEach(async uri => {
          const document = vscode.workspace.textDocuments
            .find(d => d.uri.toString() === uri.toString());
          if (document) {
            await this.setDocument(document);
          } else {
            await this.loadDocument(uri);
          }
        });
      }));
    this.disposables.push(
      vscode.workspace.onDidDeleteFiles(event => {
        event.files.forEach(uri => {
          const document = vscode.workspace.textDocuments
            .find(d => d.uri.toString() === uri.toString());
          if (document) {
            this.deleteDocument(document);
          }
        });
      }));
    this.disposables.push(
      vscode.workspace.onDidRenameFiles(event => {
        event.files.forEach(file => {
          const document = vscode.workspace.textDocuments
            .find(d => d.uri.toString() === file.oldUri.toString());
          if (document) {
            this.deleteDocument(document);
          }
        });
        event.files.forEach(async file => {
          await this.loadDocument(file.newUri);
        });
      }));
  }

  dispose(): void {
    if (!this.isDisposed) {
      this.folders.forEach(f => f.dispose());
      this.folders.clear();
      this.disposables.forEach(d => d.dispose());
      this.disposables = [];
      this.isDisposed = true;
    }
  }

  // Loads an assembly document from the URI assuming it's an assembly file
  async loadDocument(uri: vscode.Uri): Promise<void> {
    await this.getFolder(uri).set(uri);
  }

  async setDocument(document: vscode.TextDocument): Promise<void> {
    if (document.languageId === ASM6X09_LANGUAGE) {
      await this.getFolder(document).set(document);
    }
  }

  hasDocument(documentOrUri: vscode.TextDocument | vscode.Uri): boolean {
    return this.getFolder(documentOrUri).has(documentOrUri);
  }

  getAssemblyDocument(document: vscode.TextDocument): AssemblyDocument | undefined {
    return this.getFolder(document).get(document.uri);
  }

  deleteDocument(document: vscode.TextDocument): void {
    if (document.languageId === ASM6X09_LANGUAGE) {
      this.getFolder(document).delete(document);
    }
  }

  setFolder(workspaceFolder: vscode.WorkspaceFolder): void {
    this.folders.set(workspaceFolder.uri.toString(), new Folder(workspaceFolder));
  }

  deleteFolder(workspaceFolder: vscode.WorkspaceFolder): void {
    const uri = workspaceFolder.uri.toString();
    const folder = this.folders.get(uri);

    if (folder) {
      folder.dispose();
      this.folders.delete(uri);
    }
  }

  getSymbolManager(document: vscode.TextDocument): SymbolManager | undefined {
    return this.getFolder(document)?.symbolManager;
  }

  getAllSymbolManagers(): SymbolManager[] {
    return [this.defaultFolder, ...this.folders.values()].map(f => f.symbolManager);
  }

  private async updateDocument(change: vscode.TextDocumentChangeEvent): Promise<void> {
    await this.setDocument(change.document);
  }

  private getFolder(document: vscode.TextDocument | vscode.Uri): Folder {
    const uri = isTextDocument(document) ? document.uri : document;
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    const folder = workspaceFolder
      ? this.folders.get(workspaceFolder.uri.toString())
      : this.defaultFolder;

    return folder ?? this.defaultFolder;
  }
}
