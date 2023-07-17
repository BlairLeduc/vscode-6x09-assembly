import * as vscode from 'vscode';
import { ChangeCaseOpcodeCommand } from './commands';
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
import { TaskProvider } from './providers/task';
import { documentSemanticTokensLegend, DocumentSemanticTokensProvider } from './providers/documentSemanticTokens';
import { ImplementationProvider } from './providers/implementation';
import { SelectionRangeProvider } from './providers/selection-ranges';
import { WorkspaceSymbolProvider } from './providers/workspace-symbol';
import { FoldingRangeProvider } from './providers/folding-range';

const ASM6X09_LANGUAGE = 'asm6x09';
const ASM6X09_CONFIG_SECTION = '6x09Assembly';
const ASM6X09_MODE: vscode.DocumentSelector = { language: ASM6X09_LANGUAGE };

// import { DebugAdapterDescriptorFactory } from './debug/debug-adapter-descriptor-factory';
// import { DebugConfigurationProvider } from './providers/debug-configuration';
// const ASM6X09_DEBUG_TYPE: string = ASM6X09_LANGUAGE;

const disposables: Array<vscode.Disposable> = new Array<vscode.Disposable>();

export let extensionState: State;

export function activate(context: vscode.ExtensionContext): void {

  extensionState = new State(ASM6X09_CONFIG_SECTION);

  const configurationManager = extensionState.configurationManager;
  const workspaceManager = extensionState.workspaceManager;

  // Languages

  disposables.push(vscode.languages.registerCodeLensProvider(
    ASM6X09_MODE,
    new CodeLensProvider(workspaceManager, configurationManager)
  ));

  disposables.push(vscode.languages.registerCompletionItemProvider(
    ASM6X09_MODE,
    new CompletionItemProvider(workspaceManager, configurationManager),
    ' ', '\t', '\n', '.'));

  disposables.push(vscode.languages.registerDefinitionProvider(
    ASM6X09_MODE,
    new DefinitionProvider(workspaceManager)
  ));

  disposables.push(vscode.languages.registerImplementationProvider(
    ASM6X09_MODE,
    new ImplementationProvider(workspaceManager)
  ));

  disposables.push(vscode.languages.registerSelectionRangeProvider(
    ASM6X09_MODE,
    new SelectionRangeProvider(workspaceManager)
  ));

  disposables.push(vscode.languages.registerFoldingRangeProvider(
    ASM6X09_MODE,
    new FoldingRangeProvider(workspaceManager)
  ));
  
  disposables.push(vscode.languages.registerWorkspaceSymbolProvider(
    new WorkspaceSymbolProvider(workspaceManager)
  ));

  disposables.push(vscode.languages.registerDocumentHighlightProvider(
    ASM6X09_MODE,
    new DocumentHighlightProvider(workspaceManager)
  ));

  disposables.push(vscode.languages.registerDocumentSymbolProvider(
    ASM6X09_MODE,
    new DocumentSymbolProvider(workspaceManager)
  ));

  disposables.push(vscode.languages.registerDocumentSemanticTokensProvider(
    ASM6X09_MODE,
    new DocumentSemanticTokensProvider(workspaceManager),
    documentSemanticTokensLegend
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

  // Debug

  // disposables.push(vscode.debug.registerDebugConfigurationProvider(
  //   ASM6X09_DEBUG_TYPE,
  //   new DebugConfigurationProvider()
  // ));

  // disposables.push(vscode.debug.registerDebugAdapterDescriptorFactory(
  //   ASM6X09_DEBUG_TYPE,
  //   new DebugAdapterDescriptorFactory()
  // ));

  // Tasks

  disposables.push(vscode.tasks.registerTaskProvider(
    ASM6X09_LANGUAGE,
    new TaskProvider(configurationManager)
  ));

  // Workspace

  disposables.push(vscode.workspace.onDidChangeConfiguration(change => {
    if (change.affectsConfiguration(ASM6X09_CONFIG_SECTION)) {
      configurationManager.update(vscode.workspace.getConfiguration(ASM6X09_CONFIG_SECTION));
    }
  }));

  disposables.push(vscode.workspace.onDidOpenTextDocument(document => {
    workspaceManager.addDocument(document);
  }));

  disposables.push(vscode.workspace.onDidChangeTextDocument(change => {
    workspaceManager.updateDocument(change);
  }));

  disposables.push(vscode.workspace.onDidCloseTextDocument(document => {
    workspaceManager.removeDocument(document);
  }));

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

  context.subscriptions.push(...disposables.filter(d => !!d));
}

export function deactivate(): void {
  disposables.filter(d => !!d).forEach(d => d.dispose);
}
