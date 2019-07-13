import * as path from 'path';
import * as vscode from 'vscode';
import { CompletionItemProvider } from './completion';
import { AssemblyConfigurationManager } from './config';
import { DefinitionProvider } from './definition';
import { DocumentHighlightProvider } from './document-highlight';
import { ReferenceProvider } from './reference';
import { AssemblyWorkspaceManager } from './workspace-manager';

const ASM6X09_MODE: vscode.DocumentSelector = { language: 'asm6x09', scheme: 'file' };
const WorkspaceManager: AssemblyWorkspaceManager = new AssemblyWorkspaceManager(path.join(__dirname, '..'));
const ConfigurationManager: AssemblyConfigurationManager = new AssemblyConfigurationManager();

let completionItemProvider: vscode.Disposable | undefined;
let definitionProvider: vscode.Disposable | undefined;
let referenceProvider: vscode.Disposable | undefined;
let documentHighlightProvider: vscode.Disposable | undefined;
export function activate(context: vscode.ExtensionContext) {

  ConfigurationManager.update(vscode.workspace.getConfiguration('asm6x09.editor'));

  // language features
  completionItemProvider = vscode.languages.registerCompletionItemProvider(
    ASM6X09_MODE,
    new CompletionItemProvider(WorkspaceManager, ConfigurationManager),
    '\t', '\n');

  definitionProvider = vscode.languages.registerDefinitionProvider(
    ASM6X09_MODE,
    new DefinitionProvider(WorkspaceManager)
  );

  referenceProvider = vscode.languages.registerReferenceProvider(
    ASM6X09_MODE,
    new ReferenceProvider(WorkspaceManager)
  );

  documentHighlightProvider = vscode.languages.registerDocumentHighlightProvider(
    ASM6X09_MODE,
    new DocumentHighlightProvider(WorkspaceManager)
  );

  context.subscriptions.push(
    completionItemProvider,
    definitionProvider,
    referenceProvider,
    documentHighlightProvider
  );

  // Update configuration on change
  vscode.workspace.onDidChangeConfiguration(change => {
    if (change.affectsConfiguration('asm6x09.editor')) {
      ConfigurationManager.update(vscode.workspace.getConfiguration('asm6x09.editor'));
    }
  });

  // update cache when document changes
  vscode.workspace.onDidOpenTextDocument(document => {
    WorkspaceManager.addDocument(document);
  });

  vscode.workspace.onDidChangeTextDocument(change => {
    WorkspaceManager.updateDocument(change);
  });

  vscode.workspace.onDidCloseTextDocument(document => {
    WorkspaceManager.removeDocument(document);
  });

  // Workspace folders
  vscode.workspace.onDidChangeWorkspaceFolders(change => {
    change.added.forEach(folder => WorkspaceManager.addFolder(folder));
    change.removed.forEach(folder => WorkspaceManager.removeFolder(folder));
  });
}

export function deactivate(): void {
  if (completionItemProvider) {
    completionItemProvider.dispose();
  }
  if (definitionProvider) {
    definitionProvider.dispose();
  }
  if (referenceProvider) {
    referenceProvider.dispose();
  }
  if (documentHighlightProvider) {
    documentHighlightProvider.dispose();
  }
}
