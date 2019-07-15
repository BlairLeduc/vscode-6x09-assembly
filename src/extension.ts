import * as path from 'path';
import * as vscode from 'vscode';
import { ChangeCaseOpcodeCommand } from './commands';
import { CompletionItemProvider } from './completion';
import { AssemblyConfigurationManager, opcodeCase } from './config';
import { DefinitionProvider } from './definition';
import { DocumentHighlightProvider } from './document-highlight';
import { DocumentSymbolProvider } from './document-symbol';
import { HoverProvider } from './hover';
import { ReferenceProvider } from './reference';
import { RenameProvider } from './rename';
import { AssemblyWorkspaceManager } from './workspace-manager';

const ASM6X09_MODE: vscode.DocumentSelector = { language: 'asm6x09', scheme: 'file' };
const WorkspaceManager: AssemblyWorkspaceManager = new AssemblyWorkspaceManager(path.join(__dirname, '..'));
const ConfigurationManager: AssemblyConfigurationManager = new AssemblyConfigurationManager();

let completionItemProvider: vscode.Disposable | undefined;
let definitionProvider: vscode.Disposable | undefined;
let documentHighlightProvider: vscode.Disposable | undefined;
let documentSymbolProvider: vscode.Disposable | undefined;
let hoverProvider: vscode.Disposable | undefined;
let referenceProvider: vscode.Disposable | undefined;
let renameProvider: vscode.Disposable | undefined;

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

  documentHighlightProvider = vscode.languages.registerDocumentHighlightProvider(
    ASM6X09_MODE,
    new DocumentHighlightProvider(WorkspaceManager)
  );

  documentSymbolProvider = vscode.languages.registerDocumentSymbolProvider(
    ASM6X09_MODE,
    new DocumentSymbolProvider(WorkspaceManager)
  );

  hoverProvider = vscode.languages.registerHoverProvider(
    ASM6X09_MODE,
    new HoverProvider(WorkspaceManager)
  );

  referenceProvider = vscode.languages.registerReferenceProvider(
    ASM6X09_MODE,
    new ReferenceProvider(WorkspaceManager)
  );
  renameProvider = vscode.languages.registerRenameProvider(
    ASM6X09_MODE,
    new RenameProvider(WorkspaceManager)
  );

  context.subscriptions.push(
    completionItemProvider,
    definitionProvider,
    documentHighlightProvider,
    documentSymbolProvider,
    hoverProvider,
    referenceProvider,
    renameProvider
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

  // Commands
  const opcodeLowerCommand = 'asm6x09.opcodeLowercase';
  const opcodeUpperCommand = 'asm6x09.opcodeUppercase';
  const opcodeCapitaliseCommand = 'asm6x09.opcodeCapitalise';

  const lowercaseCommand = new ChangeCaseOpcodeCommand(WorkspaceManager, opcodeCase.lowercase);
  context.subscriptions.push(vscode.commands.registerTextEditorCommand(opcodeLowerCommand, lowercaseCommand.handler, lowercaseCommand));

  const uppercaseCommand = new ChangeCaseOpcodeCommand(WorkspaceManager, opcodeCase.uppercase);
  context.subscriptions.push(vscode.commands.registerTextEditorCommand(opcodeUpperCommand, uppercaseCommand.handler, uppercaseCommand));

  const capitalizeCommand = new ChangeCaseOpcodeCommand(WorkspaceManager, opcodeCase.capitalised);
  context.subscriptions.push(vscode.commands.registerTextEditorCommand(opcodeCapitaliseCommand, capitalizeCommand.handler, capitalizeCommand));
}

export function deactivate(): void {
  if (completionItemProvider) {
    completionItemProvider.dispose();
  }
  if (definitionProvider) {
    definitionProvider.dispose();
  }
  if (documentHighlightProvider) {
    documentHighlightProvider.dispose();
  }
  if (documentSymbolProvider) {
    documentSymbolProvider.dispose();
  }
  if (hoverProvider) {
    hoverProvider.dispose();
  }
  if (referenceProvider) {
    referenceProvider.dispose();
  }
}
