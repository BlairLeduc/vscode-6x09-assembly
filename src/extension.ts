import * as vscode from 'vscode';
import { ChangeCaseOpcodeCommand, StartEmulatorCommand } from './commands';
import { OpcodeCase } from './managers/configuration';
import { CodeLensProvider } from './providers/codelens';
import { CompletionItemProvider } from './providers/completion';
import { DefinitionProvider } from './providers/definition';
import { DocumentHighlightProvider } from './providers/document-highlight';
import { DocumentSymbolProvider } from './providers/document-symbol';
import { HoverProvider } from './providers/hover';
import { ReferenceProvider } from './providers/reference';
import { RenameProvider } from './providers/rename';
import { State } from './state';

const ASM6X09_LANGUAGE = 'asm6x09';
const ASM6X09_MODE: vscode.DocumentSelector = { language: ASM6X09_LANGUAGE, scheme: 'file' };
const disposables: Array<vscode.Disposable | undefined> = new Array<vscode.Disposable | undefined>();

export let ExtensionState: State;

export function activate(context: vscode.ExtensionContext): void {

  ExtensionState = new State(ASM6X09_LANGUAGE);

  const configurationManager = ExtensionState.configurationManager;
  // const windowManager = ExtensionState.windowManager;
  const workspaceManager = ExtensionState.workspaceManager;

  // language features
  disposables.push(vscode.languages.registerCodeLensProvider(
    ASM6X09_MODE,
    new CodeLensProvider(workspaceManager, configurationManager)
  ));

  disposables.push(vscode.languages.registerCompletionItemProvider(
    ASM6X09_MODE,
    new CompletionItemProvider(workspaceManager, configurationManager),
    '\t', '\n'));

  disposables.push(vscode.languages.registerDefinitionProvider(
    ASM6X09_MODE,
    new DefinitionProvider(workspaceManager)
  ));

  disposables.push(vscode.languages.registerDocumentHighlightProvider(
    ASM6X09_MODE,
    new DocumentHighlightProvider(workspaceManager)
  ));

  disposables.push(vscode.languages.registerDocumentSymbolProvider(
    ASM6X09_MODE,
    new DocumentSymbolProvider(workspaceManager)
  ));

  disposables.push(vscode.languages.registerHoverProvider(
    ASM6X09_MODE,
    new HoverProvider(workspaceManager, configurationManager)
  ));

  disposables.push(vscode.languages.registerReferenceProvider(
    ASM6X09_MODE,
    new ReferenceProvider(workspaceManager)
  ));

  disposables.push(vscode.languages.registerRenameProvider(
    ASM6X09_MODE,
    new RenameProvider(workspaceManager)
  ));

  // Update configuration on change
  disposables.push(vscode.workspace.onDidChangeConfiguration(change => {
    if (change.affectsConfiguration(ASM6X09_LANGUAGE)) {
      configurationManager.update(vscode.workspace.getConfiguration(ASM6X09_LANGUAGE));
    }
  }));

  // update cache when document changes
  disposables.push(vscode.workspace.onDidOpenTextDocument(document => {
    workspaceManager.addDocument(document, undefined);
  }));

  disposables.push(vscode.workspace.onDidChangeTextDocument(change => {
    workspaceManager.updateDocument(change);
  }));

  disposables.push(vscode.workspace.onDidCloseTextDocument(document => {
    workspaceManager.removeDocument(document);
  }));

  disposables.push(vscode.window.onDidChangeActiveTextEditor(textEditor => {
    // WorkspaceManager.
  }));

  // Workspace folders
  disposables.push(vscode.workspace.onDidChangeWorkspaceFolders(change => {
    change.added.forEach(folder => workspaceManager.addFolder(folder));
    change.removed.forEach(folder => workspaceManager.removeFolder(folder));
  }));

  // Commands
  const lowercaseCommand = new ChangeCaseOpcodeCommand(workspaceManager, OpcodeCase.lowercase);
  disposables.push(vscode.commands.registerTextEditorCommand(
    'asm6x09.opcodeLowercase',
    lowercaseCommand.handler,
    lowercaseCommand));

  const uppercaseCommand = new ChangeCaseOpcodeCommand(workspaceManager, OpcodeCase.uppercase);
  disposables.push(vscode.commands.registerTextEditorCommand(
    'asm6x09.opcodeUppercase',
    uppercaseCommand.handler,
    uppercaseCommand));

  const capitalizeCommand = new ChangeCaseOpcodeCommand(workspaceManager, OpcodeCase.capitalised);
  disposables.push(vscode.commands.registerTextEditorCommand(
    'asm6x09.opcodeCapitalise',
    capitalizeCommand.handler,
    capitalizeCommand));

  const startEmulatorCommand = new StartEmulatorCommand(configurationManager);
  disposables.push(vscode.commands.registerCommand(
    'asm6x09.startEmulator',
    startEmulatorCommand.handler,
    startEmulatorCommand));

  context.subscriptions.push(...disposables.filter(d => !!d));
}

export function deactivate(): void {
  disposables.filter(d => !!d).forEach(d => d.dispose);
}
