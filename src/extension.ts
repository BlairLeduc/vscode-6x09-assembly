import * as path from 'path';
import * as vscode from 'vscode';
import { CompletionItemProvider } from './completion';
import { DefinitionProvider } from './definition';
import { DocumentHighlightProvider } from './document-highlight';
import { AssemblyDocument, AssemblyDocuments } from './parser';
import { ReferenceProvider } from './reference';

const ASM6X09_MODE: vscode.DocumentSelector = { language: 'asm6x09', scheme: 'file' };

export function activate(context: vscode.ExtensionContext) {

  // language features
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
    ASM6X09_MODE,
    new CompletionItemProvider(),
    '\t', '\n'));

  context.subscriptions.push(vscode.languages.registerDefinitionProvider(
    ASM6X09_MODE,
    new DefinitionProvider()
  ));

  context.subscriptions.push(vscode.languages.registerReferenceProvider(
    ASM6X09_MODE,
    new ReferenceProvider()
  ));

  context.subscriptions.push(vscode.languages.registerDocumentHighlightProvider(
    ASM6X09_MODE,
    new DocumentHighlightProvider()
  ));

  // update cache when document changes
  vscode.workspace.onDidOpenTextDocument(document => {
    AssemblyDocuments[document.uri.toString()] = new AssemblyDocument(document);
  });

  vscode.workspace.onDidChangeTextDocument(change => {
    AssemblyDocuments[change.document.uri.toString()] = new AssemblyDocument(change.document);
  });

  vscode.workspace.onDidCloseTextDocument(document => {
    AssemblyDocuments[document.uri.toString()] = null;
  });
}
