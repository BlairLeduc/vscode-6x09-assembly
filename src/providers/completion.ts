import * as vscode from 'vscode';
import { ConfigurationManager, HelpVerbosity as HelpVerbosity, OpcodeCase } from '../managers/configuration';
import { WorkspaceManager } from '../managers/workspace';
import { AssemblySymbol, Registers } from '../common';
import { DocOpcode } from '../parsers/docs';
import { convertToCase } from '../utilities';

export class CompletionItemProvider implements vscode.CompletionItemProvider {

  constructor(private workspaceManager: WorkspaceManager, private configurationManager: ConfigurationManager) {
  }

  public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem[]> {
    return new Promise((resolve, reject) => {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);
      const symbolManager = this.workspaceManager.getSymbolManager(document);

      if (!token.isCancellationRequested) {
        const assemblyLine = assemblyDocument.lines[position.line];
        const casing = this.configurationManager.opcodeCasing;

        if (assemblyLine.opCodeRange && assemblyLine.opCodeRange.contains(position)) {
          const items = this.workspaceManager.opcodeDocs
            .findOpcode(assemblyLine.opCode.text.toUpperCase())
            .map(opcode => this.createOpcodeCompletionItem(opcode, casing));
          resolve([...items, ...symbolManager.symbols
            .filter(t => t.kind === vscode.CompletionItemKind.Method)
            .map(t => this.createSymbolCompletionItem(t))]);
        } else if (assemblyLine.operandRange && assemblyLine.operandRange.contains(position)) {

          resolve([...Array.from(Registers).map(r => this.createRegisterCompletionItem(r)),
                   ...assemblyDocument.symbols
                      .filter(s => s.blockNumber === 0 || s.blockNumber === assemblyLine.blockNumber)
                      .map(s => this.createSymbolCompletionItem(s))]);
        } else {
          reject();
        }
      } else {
        reject();
      }
    });
  }

  private createRegisterCompletionItem(register: string): vscode.CompletionItem {
    const item = new vscode.CompletionItem(register, vscode.CompletionItemKind.Variable);
    item.detail = "Register";
    return item;
  }

  private createSymbolCompletionItem(symbol: AssemblySymbol): vscode.CompletionItem {
    const item = new vscode.CompletionItem(symbol.text, this.getItemKindFromKind(symbol.kind));

    if (symbol.definition) {
      symbol = symbol.definition;
    }
    if (symbol.documentation) {
      item.detail = symbol.documentation;
    }

    return item;
  }

  private getItemKindFromKind(kind: vscode.CompletionItemKind): vscode.CompletionItemKind {
    switch (kind) {
      case vscode.CompletionItemKind.Method:
      case vscode.CompletionItemKind.Class:
        return vscode.CompletionItemKind.Function;
      case vscode.CompletionItemKind.Variable:
        return vscode.CompletionItemKind.Field;
      default:
        return kind;
    }
  }

  private createOpcodeCompletionItem(opcode: DocOpcode, casing: OpcodeCase): vscode.CompletionItem {
    const item = new vscode.CompletionItem(convertToCase(opcode.name, casing), vscode.CompletionItemKind.Keyword);

    item.detail = opcode.summary;
    if (opcode.processor === '6309') {
      item.detail += ' (6309)';
    }

    if (this.configurationManager.helpVerbosity === HelpVerbosity.full && opcode.documentation) {
      item.documentation = new vscode.MarkdownString(opcode.documentation);
    }

    return item;
  }
}
