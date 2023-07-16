import * as vscode from 'vscode';
import { ConfigurationManager, HelpVerbosity as HelpVerbosity, OpcodeCase } from '../managers/configuration';
import { WorkspaceManager } from '../managers/workspace';
import { AssemblySymbol, registers } from '../common';
import { DocOpcode } from '../parsers/docs';
import { convertToCase } from '../utilities';

export class CompletionItemProvider implements vscode.CompletionItemProvider {

  constructor(private workspaceManager: WorkspaceManager, private configurationManager: ConfigurationManager) {
  }

  public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, _: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionList> {
    return new Promise((resolve, reject) => {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);
      const symbolManager = this.workspaceManager.getSymbolManager(document);

      if (assemblyDocument && !token.isCancellationRequested) {
        const assemblyLine = assemblyDocument.lines[position.line];
        const casing = this.configurationManager.opcodeCasing;

        if ((assemblyLine.opCodeRange && assemblyLine.opCodeRange.contains(position))
              || (assemblyLine.typeRange && assemblyLine.typeRange.contains(position))) {
          const text = assemblyLine.opCode?.text ?? assemblyLine.type?.text ?? '';
          const opcodes = this.workspaceManager.opcodeDocs.findOpcode(text.toUpperCase())
            .map(opcode => this.createOpcodeCompletionItem(opcode, casing));
          const types = symbolManager.symbols.filter(t => t.kind === vscode.CompletionItemKind.Struct || t.kind === vscode.CompletionItemKind.Method)
            .map(type => this.createSymbolCompletionItem(type));
          const completions = [...opcodes, ...types];

          resolve(new vscode.CompletionList(completions));

        } else if (assemblyLine.operandRange && assemblyLine.operandRange.contains(position)) {
          const word = this.findWord(document.getText(assemblyLine.lineRange), position.character);
          const parts = word.split('.');
          if (parts.length > 1) {
            const symbol = symbolManager.symbols.find(s => s.text === parts[0]);
            if (symbol && symbol.definition?.kind === vscode.CompletionItemKind.Struct) {
              resolve(new vscode.CompletionList(symbol.definition.properties.map(p => this.createSymbolCompletionItem(p))));
              return;
            }
          }
          
          const regs = Array.from(registers).map(r => this.createRegisterCompletionItem(r));
          const symbols = assemblyDocument.symbols.filter(s => s.blockNumber === 0 || s.blockNumber === assemblyLine.blockNumber)
            .map(s => this.createSymbolCompletionItem(s));

          resolve(new vscode.CompletionList([...regs, ...symbols]));
        } else {
          reject();
        }
      } else {
        reject();
      }
    });
  }

  private findWord(line: string, start: number): string {
    let match: RegExpExecArray | null;
    while(match = /^([a-z_@$.][a-z0-9.$_@?]*)/i.exec(line.substr(start - 1))) {
      if (match) {
        start -= 1;
      }
    }
    return line.substr(start);
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
