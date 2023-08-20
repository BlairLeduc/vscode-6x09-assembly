import * as vscode from 'vscode';

import { convertToCase } from '../common';
import { registers, HelpLevel, OpcodeCase } from '../constants';
import { ConfigurationManager, WorkspaceManager } from '../managers';
import { AssemblySymbol, DocOpcode } from '../parsers';

export class CompletionItemProvider implements vscode.CompletionItemProvider {

  constructor(
    private workspaceManager: WorkspaceManager,
    private configurationManager: ConfigurationManager) {
  }

  public async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    cancellationToken: vscode.CancellationToken,
    _: vscode.CompletionContext): Promise<vscode.CompletionList | undefined> {

    if (!cancellationToken.isCancellationRequested) {
      const assemblyDocument = this.workspaceManager
        .getDocument(document, cancellationToken);

      const symbolManager = this.workspaceManager.getSymbolManager(document);

      if (assemblyDocument && symbolManager) {
        const assemblyLine = assemblyDocument.lines[position.line];
        const casing = this.configurationManager.opcodeCasing;

        if ((assemblyLine.opCodeRange && assemblyLine.opCodeRange.contains(position))
          || (assemblyLine.typeRange && assemblyLine.typeRange.contains(position))) {
          const text = assemblyLine.opCode?.text ?? assemblyLine.type?.text ?? '';
          const opcodes = this.workspaceManager.docs.findOpcode(text.toUpperCase())
            .map(opcode => this.createOpcodeCompletionItem(opcode, casing));

          const types = symbolManager.implementations
            .filter(t => t.kind === vscode.CompletionItemKind.Struct
              || t.kind === vscode.CompletionItemKind.Method)
            .map(type => this.createSymbolCompletionItem(type));

          const completions = [...opcodes, ...types];

          return new vscode.CompletionList(completions);

        } else if (assemblyLine.operandRange && assemblyLine.operandRange.contains(position)) {
          const word = this.findWord(document.getText(assemblyLine.lineRange), position.character);
          const parts = word.split('.');

          if (parts.length > 1) {
            const symbol = symbolManager.implementations.find(s => s.text === parts[0]);

            if (symbol && symbol.kind === vscode.CompletionItemKind.Variable) {
              const definition = symbolManager.implementations.find(s => s.text === symbol.value);

              if (definition && definition.properties) {
                return new vscode.CompletionList(definition.properties
                  .map(p => this.createSymbolCompletionItem(p)));
              }
            }
          }

          const regs = Array.from(registers).map(r => this.createRegisterCompletionItem(r));
          const symbols = symbolManager.implementations
            .filter(s => s.uri.toString() === document.uri.toString()
              && (s.blockNumber === 0 || s.blockNumber === assemblyLine.blockNumber))
            .map(s => this.createSymbolCompletionItem(s));

          return new vscode.CompletionList([...regs, ...symbols]);
        }
      }
    }
  }

  private findWord(line: string, start: number): string {
    let match: RegExpExecArray | null;
    while (match = /^([a-z_@$.][a-z0-9.$_@?]*)/i.exec(line.substring(start - 1))) {
      if (match) {
        start -= 1;
      }
    }
    return line.substring(start);
  }

  private createRegisterCompletionItem(register: string): vscode.CompletionItem {
    const item = new vscode.CompletionItem(register, vscode.CompletionItemKind.Variable);
    item.detail = "Register";
    return item;
  }

  private createSymbolCompletionItem(symbol: AssemblySymbol): vscode.CompletionItem {
    const item = new vscode.CompletionItem(symbol.text, this.getItemKindFromKind(symbol.kind));

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
    const item = new vscode.CompletionItem(
      convertToCase(opcode.name, casing),
      vscode.CompletionItemKind.Keyword);

    item.detail = opcode.summary;
    if (opcode.processor === '6309') {
      item.detail += ' (6309)';
    }

    if (this.configurationManager.helpLevel === HelpLevel.full && opcode.documentation) {
      item.documentation = new vscode.MarkdownString(opcode.documentation);
    }

    return item;
  }
}
