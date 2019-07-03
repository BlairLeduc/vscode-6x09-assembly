import * as vscode from 'vscode';
import { CompletionItemProvider } from './completion';
import { DefinitionProvider } from './definition';
import { DocumentHighlightProvider } from './document-highlight';
import { ReferenceProvider } from './reference';
import { AssemblyWorkspaceManager } from './workspace-manager';

const ASM6X09_MODE: vscode.DocumentSelector = { language: 'asm6x09', scheme: 'file' };
const WorkspaceManager: AssemblyWorkspaceManager = new AssemblyWorkspaceManager();

export function activate(context: vscode.ExtensionContext) {

  // language features
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
    ASM6X09_MODE,
    new CompletionItemProvider(WorkspaceManager),
    '\t', '\n'));

  context.subscriptions.push(vscode.languages.registerDefinitionProvider(
    ASM6X09_MODE,
    new DefinitionProvider(WorkspaceManager)
  ));

  context.subscriptions.push(vscode.languages.registerReferenceProvider(
    ASM6X09_MODE,
    new ReferenceProvider(WorkspaceManager)
  ));

  context.subscriptions.push(vscode.languages.registerDocumentHighlightProvider(
    ASM6X09_MODE,
    new DocumentHighlightProvider(WorkspaceManager)
  ));

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
