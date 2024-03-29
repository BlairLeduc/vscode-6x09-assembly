import * as vscode from 'vscode';
import * as path from 'path';

import { ChangeCaseOpcodeCommand } from './commands';
import { ASM6X09_CONFIG_SECTION, ASM6X09_LANGUAGE, ASM6X09_MODE, OpcodeCase } from './constants';
import { ConfigurationManager, WorkspaceManager } from './managers';
import {
  CodeLensProvider,
  CompletionItemProvider,
  DefinitionProvider,
  DocumentHighlightProvider,
  DocumentLinkProvider,
  documentSemanticTokensLegend,
  DocumentSemanticTokensProvider,
  DocumentSymbolProvider,
  FoldingRangeProvider,
  HoverProvider,
  ImplementationProvider,
  ReferenceProvider,
  RenameProvider,
  TaskProvider,
  WorkspaceSymbolProvider
} from './providers';
import { Logger } from './logger';

// import { DebugAdapterDescriptorFactory } from './debug/debug-adapter-descriptor-factory';
// import { DebugConfigurationProvider } from './providers/debug-configuration';
// const ASM6X09_DEBUG_TYPE: string = ASM6X09_LANGUAGE;

const disposables: vscode.Disposable[] = [];

export async function activate(context: vscode.ExtensionContext): Promise<void> {

  Logger.init();
  Logger.info(`Language Extension ${ASM6X09_LANGUAGE} started`);

  const configurationManager = new ConfigurationManager(ASM6X09_CONFIG_SECTION);
  disposables.push(configurationManager);

  const workspaceManager = new WorkspaceManager(path.join(__dirname, '..'));
  await workspaceManager.init();
  disposables.push(workspaceManager);

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

  disposables.push(vscode.languages.registerFoldingRangeProvider(
    ASM6X09_MODE,
    new FoldingRangeProvider(workspaceManager)
  ));

  disposables.push(vscode.languages.registerWorkspaceSymbolProvider(
    new WorkspaceSymbolProvider(workspaceManager)
  ));

  disposables.push(vscode.languages.registerDocumentLinkProvider(
    ASM6X09_MODE,
    new DocumentLinkProvider(workspaceManager)
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
