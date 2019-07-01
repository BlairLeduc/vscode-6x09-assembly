import * as path from 'path';
import * as vscode from 'vscode';
import { CompletionItemProvider } from './completion';

export function activate(context: vscode.ExtensionContext) {

  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
    { language: 'asm6x09', scheme: 'file' },
    new CompletionItemProvider(),
    '\t', '\n'));
}
