import * as vscode from 'vscode';
import { AssemblyConfigurationManager, opcodeCase } from './config';
import { DocOpcode } from './docs';
import { AssemblySymbol } from './parser';
import { convertToCase } from './utilities';
import { AssemblyWorkspaceManager } from './workspace-manager';

export class CompletionItemProvider implements vscode.CompletionItemProvider {

  constructor(private workspaceManager: AssemblyWorkspaceManager, private configurationManager: AssemblyConfigurationManager) {
  }

  public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.CompletionItem[]> {
    return new Promise((resolve, reject) => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const word = document.getText(range);

        const assemblyDocument = this.workspaceManager.getAssemblyDocument(document);
        const assemblyLine = assemblyDocument.lines[position.line];
        const casing = this.configurationManager.getOpcodeCasing();

        if (assemblyLine.opcode && range.intersection(assemblyLine.opcodeRange)) {
          const items = this.workspaceManager.opcodeDocs.findOpcode(word.toUpperCase()).map(opcode => this.createOpcodeCompletionItem(opcode, casing));
          resolve(items.concat(assemblyDocument.findMacro(word).map(label => this.createSymbolCompletionItem(label))));
        }

        if (assemblyLine.operand && range.intersection(assemblyLine.operandRange)) {
          resolve(assemblyDocument.findLabel(word).map(label => this.createSymbolCompletionItem(label)));
          return;
        }
      }

      reject();
    });
  }

  private createSymbolCompletionItem(symbol: AssemblySymbol): vscode.CompletionItem {
    const item = new vscode.CompletionItem(symbol.name, symbol.kind);
    if (symbol.documentation) {
      item.detail = symbol.documentation;
    }

    return item;
  }

  private createOpcodeCompletionItem(opcode: DocOpcode, casing: opcodeCase): vscode.CompletionItem {
    const item = new vscode.CompletionItem(convertToCase(opcode.name, casing), vscode.CompletionItemKind.Keyword);
    item.detail = opcode.documentation;
    if (opcode.processor === '6309') {
      item.detail = '(6309) ' + item.detail;
    }
    // TODO: add documentation for opcodes, for example:
    // item.documentation = new vscode.MarkdownString(opcode.documentation);
    return item;
  }
}
