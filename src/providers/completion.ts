import * as vscode from 'vscode';
import { ConfigurationManager, OpcodeCase } from '../managers/configuration';
import { WorkspaceManager } from '../managers/workspace';
import { AssemblyToken, Registers } from '../common';
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

        const lineToken = assemblyLine.tokens.find(t => t.range.contains(position));
        if (lineToken.kind === vscode.CompletionItemKind.Keyword || lineToken.kind === vscode.CompletionItemKind.Method) {
          const items = this.workspaceManager.opcodeDocs
                          .findOpcode(lineToken.text.toUpperCase())
                          .map(opcode => this.createOpcodeCompletionItem(opcode, casing));
          resolve([...items, ...symbolManager.tokens
                                .filter(t => t.kind === vscode.CompletionItemKind.Method)
                                .map(t => this.createSymbolCompletionItem(t))]);
  
        } else if (assemblyLine.operandRange && assemblyLine.operandRange.contains(position)) {
          resolve([...Registers.map(r => this.createRegisterCompletionItem(r)),
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

  private createRegisterCompletionItem(register:string): vscode.CompletionItem {
    const item = new vscode.CompletionItem(register, vscode.CompletionItemKind.Variable);
    item.detail = "Register";
    return item;
  }

  private createSymbolCompletionItem(symbol: AssemblyToken): vscode.CompletionItem {
    const item = new vscode.CompletionItem(symbol.text, symbol.kind);
    if (symbol.parent) {
      symbol = symbol.parent;
    }
    if (symbol.documentation) {
      item.detail = symbol.documentation;
    }

    return item;
  }

  private createOpcodeCompletionItem(opcode: DocOpcode, casing: OpcodeCase): vscode.CompletionItem {
    const item = new vscode.CompletionItem(convertToCase(opcode.name, casing), vscode.CompletionItemKind.Keyword);
    item.detail = opcode.summary;
    if (opcode.processor === '6309') {
      item.detail = '(6309) ' + item.detail;
    }
    item.documentation = new vscode.MarkdownString(opcode.documentation);
    return item;
  }
}
