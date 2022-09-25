import * as vscode from 'vscode';
import { Collection } from '../collection';
import { AssemblyDocument } from '../parsers/assembly-document';
import { Docs } from '../parsers/docs';
import * as fs from 'fs';
import { SymbolManager } from './symbol';
import path = require('path');

export class Folder implements vscode.Disposable {
  private readonly managed: boolean;
  public readonly path: string;
  public documents: Collection<AssemblyDocument> = new Collection<AssemblyDocument>();
  public watched: Collection<Collection<fs.FSWatcher>> = new Collection<Collection<fs.FSWatcher>>();

  constructor(public symbolManager: SymbolManager, public uri?: vscode.Uri) {
    this.path = this.uri.fsPath;
    this.managed = this.path !== 'none';
  }

  dispose(): void {
    if (this.managed) {
      this.watched.values().forEach(wa => wa.values().forEach(w => w.close()));    }
  }

  public containsAssemblyDocument(document: vscode.TextDocument): boolean {
    return this.documents.containsKey(document.uri);
  }

  public addAssemblyDocument(document: vscode.TextDocument, token: vscode.CancellationToken): AssemblyDocument {
    if (this.managed) {
      const assemblyDocument = this.documents.add(document.uri, new AssemblyDocument(this.symbolManager, document, undefined, token));
      this.addFilesToWatch(document, assemblyDocument);
      return assemblyDocument;
    }
    return undefined;
  }

  public getAssemblyDocument(document: vscode.TextDocument): AssemblyDocument {
    return this.documents.get(document.uri);
  }

  public updateAssemblyDocument(document: vscode.TextDocument, _?: readonly vscode.TextDocumentContentChangeEvent[]): AssemblyDocument {
    if (this.managed) {
      // Optimisation potential: look at what changed in document instead of re-parsing the whole thing
      const assemblyDocument = this.documents.add(document.uri, new AssemblyDocument(this.symbolManager, document));
      this.addFilesToWatch(document, assemblyDocument);
      return assemblyDocument;
    }
    return undefined;
  }

  public removeAssemblyDocument(document: vscode.TextDocument): void {
    if (this.managed) {
      this.removeFilesToWatch(document.uri);
      this.documents.remove(document.uri);
    }
  }

  private addFilesToWatch(document: vscode.TextDocument, assemblyDocument: AssemblyDocument): void {
    if (this.watched.containsKey(document.uri)) {
      this.removeFilesToWatch(document.uri);
    }

    const filesToWatch = new Collection<fs.FSWatcher>();
    assemblyDocument.referencedDocuments.forEach(fileUri => {
      filesToWatch.add(fileUri, fs.watch(fileUri.fsPath, () => { process.stdout.write("watcher: "); this.updateAssemblyDocument(document); }));
    });
    this.watched.add(document.uri, filesToWatch);
  }

  private removeFilesToWatch(uri: vscode.Uri): void {
    this.watched.get(uri).values().forEach(wa => wa.close());
    this.watched.remove(uri);
  }
}

export class WorkspaceManager implements vscode.Disposable {
  private static readonly NoWorkspaceUri = 'wsf:none';
  public readonly opcodeDocs: Docs;
  public symbolManager: SymbolManager;


  private folders: Collection<Folder> = new Collection<Folder>();

  constructor(extensionPath: string) {
    this.opcodeDocs = new Docs(extensionPath);
    this.symbolManager = new SymbolManager();
  }

  public dispose(): void {
    this.folders.values().forEach(f => f.dispose());
    this.symbolManager.dispose();
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
    return this.folders.add(workspaceFolder.uri, new Folder(this.symbolManager, workspaceFolder.uri));
  }

  public removeFolder(workspaceFolder: vscode.WorkspaceFolder): void {
    this.folders.get(workspaceFolder.uri).dispose();
    this.folders.remove(workspaceFolder.uri);
  }

  public getSymbolManager(document?: vscode.TextDocument): SymbolManager {
    if (document) {
      const folder = this.getOrCreateFolder(document);

      if (!folder.containsAssemblyDocument(document)) {
        folder.addAssemblyDocument(document, null);
      }
    }
    return this.symbolManager;
  }

  private getOrCreateFolder(document: vscode.TextDocument): Folder {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    const uri = workspaceFolder ? workspaceFolder.uri : document.uri.with({path: path.dirname(document.uri.path)});

    if (!this.folders.containsKey(uri)) {
      return this.folders.add(uri, new Folder(this.symbolManager, uri));
    }
    return this.folders.get(uri);
  }
}
