import * as path from 'path';
import * as vscode from 'vscode';
import { CodeLensProvider } from './codelens';
import { ChangeCaseOpcodeCommand } from './commands';
import { CompletionItemProvider } from './completion';
import { AssemblyConfigurationManager, OpcodeCase } from './config-manager';
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
const disposables: Array<vscode.Disposable| undefined> = new Array<vscode.Disposable | undefined>();

export function activate(context: vscode.ExtensionContext) {

  ConfigurationManager.update(vscode.workspace.getConfiguration('asm6x09.editor'));

  // language features
  disposables.push(vscode.languages.registerCodeLensProvider(
    ASM6X09_MODE,
    new CodeLensProvider(WorkspaceManager, ConfigurationManager)
  ));

  disposables.push(vscode.languages.registerCompletionItemProvider(
    ASM6X09_MODE,
    new CompletionItemProvider(WorkspaceManager, ConfigurationManager),
    '\t', '\n'));

  disposables.push(vscode.languages.registerDefinitionProvider(
    ASM6X09_MODE,
    new DefinitionProvider(WorkspaceManager)
  ));

  disposables.push(vscode.languages.registerDocumentHighlightProvider(
    ASM6X09_MODE,
    new DocumentHighlightProvider(WorkspaceManager)
  ));

  disposables.push(vscode.languages.registerDocumentSymbolProvider(
    ASM6X09_MODE,
    new DocumentSymbolProvider(WorkspaceManager)
  ));

  disposables.push(vscode.languages.registerHoverProvider(
    ASM6X09_MODE,
    new HoverProvider(WorkspaceManager, ConfigurationManager)
  ));

  disposables.push(vscode.languages.registerReferenceProvider(
    ASM6X09_MODE,
    new ReferenceProvider(WorkspaceManager)
  ));

  disposables.push(vscode.languages.registerRenameProvider(
    ASM6X09_MODE,
    new RenameProvider(WorkspaceManager)
  ));

  // Update configuration on change
  disposables.push(vscode.workspace.onDidChangeConfiguration(change => {
    if (change.affectsConfiguration('asm6x09.editor')) {
      ConfigurationManager.update(vscode.workspace.getConfiguration('asm6x09.editor'));
    }
  }));

  // update cache when document changes
  disposables.push(vscode.workspace.onDidOpenTextDocument(document => {
    WorkspaceManager.addDocument(document);
  }));

  disposables.push(vscode.workspace.onDidChangeTextDocument(change => {
    WorkspaceManager.updateDocument(change);
  }));

  disposables.push(vscode.workspace.onDidCloseTextDocument(document => {
    WorkspaceManager.removeDocument(document);
  }));

  disposables.push(vscode.window.onDidChangeActiveTextEditor(textEditor => {
    // WorkspaceManager.
  }));

  // Workspace folders
  disposables.push(vscode.workspace.onDidChangeWorkspaceFolders(change => {
    change.added.forEach(folder => WorkspaceManager.addFolder(folder));
    change.removed.forEach(folder => WorkspaceManager.removeFolder(folder));
  }));

  // Commands
  const opcodeLowerCommand = 'asm6x09.opcodeLowercase';
  const opcodeUpperCommand = 'asm6x09.opcodeUppercase';
  const opcodeCapitaliseCommand = 'asm6x09.opcodeCapitalise';

  const lowercaseCommand = new ChangeCaseOpcodeCommand(WorkspaceManager, OpcodeCase.lowercase);
  disposables.push(vscode.commands.registerTextEditorCommand(
    opcodeLowerCommand,
    lowercaseCommand.handler,
    lowercaseCommand));

  const uppercaseCommand = new ChangeCaseOpcodeCommand(WorkspaceManager, OpcodeCase.uppercase);
  disposables.push(vscode.commands.registerTextEditorCommand(
    opcodeUpperCommand,
    uppercaseCommand.handler,
    uppercaseCommand));

  const capitalizeCommand = new ChangeCaseOpcodeCommand(WorkspaceManager, OpcodeCase.capitalised);
  disposables.push(vscode.commands.registerTextEditorCommand(
    opcodeCapitaliseCommand,
    capitalizeCommand.handler,
    capitalizeCommand));

  context.subscriptions.push(...disposables.filter(d => !!d));
}

export function deactivate(): void {
  disposables.filter(d => !!d).forEach(d => d.dispose);
}
