import * as vscode from 'vscode';
import { convertTokenToName } from '../common';
import { HelpLevel, TokenType } from '../constants';
import { ConfigurationManager, WorkspaceManager } from '../managers';
import { DocOpcodeType } from '../parsers';

export class HoverProvider implements vscode.HoverProvider {
  private helpVerbosity = HelpLevel.full;
  private onDidChangeHelpVerbosityEmitter = new vscode.EventEmitter<void>();

  constructor(
    private workspaceManager: WorkspaceManager,
    private configurationManager: ConfigurationManager) {

    this.helpVerbosity = configurationManager.helpVerbosity;

    configurationManager.onDidChangeConfiguration(() => {
      const helpVerbosity = this.configurationManager.helpVerbosity;
      if (this.helpVerbosity !== helpVerbosity) {
        this.helpVerbosity = helpVerbosity;
        this.onDidChangeHelpVerbosityEmitter.fire();
      }
    });
  }

  public async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    cancellationToken: vscode.CancellationToken): Promise<vscode.Hover | undefined> {

    if (this.helpVerbosity !== HelpLevel.none && !cancellationToken.isCancellationRequested) {
      const assemblyDocument = this.workspaceManager
        .getAssemblyDocument(document, cancellationToken);

      const symbolManager = this.workspaceManager.getSymbolManager(document);

      if (assemblyDocument && symbolManager) {
        const assemblyLine = assemblyDocument.lines[position.line];

        if (assemblyLine.opCodeRange && assemblyLine.opCodeRange.contains(position)) {
          const opCode = assemblyLine.opCode;
          const opCodeDocs = this.workspaceManager.opcodeDocs.getOpcode(opCode?.text);

          if (opCodeDocs) {
            const help = new vscode.MarkdownString();
            let processorSpec = ' -';

            if (opCodeDocs.type === DocOpcodeType.opcode) {
              processorSpec = opCodeDocs.processor === '6809' ? ' (6809/6309)' : ' (6309)';
            }

            help.appendCodeblock(
              `(${DocOpcodeType[opCodeDocs.type]}) ${opCode!.text}${processorSpec} `
              + `${opCodeDocs.summary}`);

            let documentation = opCodeDocs.type === DocOpcodeType.opcode
              ? `${opCodeDocs.notation}　⸺　${opCodeDocs.conditionCodes}`
              : '';

            if (this.configurationManager.helpVerbosity === HelpLevel.full
              && opCodeDocs.documentation) {

              documentation += `  \n  \n${opCodeDocs.documentation}`;
            }

            if (documentation) {
              help.appendMarkdown('---\n' + documentation);
            }

            return new vscode.Hover(help, assemblyLine.opCodeRange);
          }
        }

        if (assemblyLine.typeRange && assemblyLine.typeRange.contains(position)) {
          const type = assemblyLine.type;
          const symbol = symbolManager.implementations.find(s => s.text === type?.text);

          if (type && symbol) {
            const help = new vscode.MarkdownString();

            help.appendCodeblock(
              `(${type.type === TokenType.macro ? 'macro' : 'struct'}) ${type.text}`);

            if (symbol.documentation) {
              help.appendMarkdown('---\n' + symbol.documentation);
            }

            return new vscode.Hover(help, assemblyLine.opCodeRange);
          }
          return;
        }

        const reference = assemblyLine.references
          .find(r => r.range.contains(position)) ?? assemblyLine.label;

        if (reference && reference.range.contains(position)) {
          const symbol = symbolManager.implementations.find(i => i.text === reference.text);

          if (symbol) {
            const documentation = symbol.documentation;
            const value = symbol.value;
            const parentName = symbol.parent ? `${symbol.parent.text}.` : '';
            let header = `(${convertTokenToName(symbol.semanticToken)}) ${parentName}${symbol.text}`;
            if (value) {
              header += ` ${value}`;
            }
            const help = new vscode.MarkdownString();

            help.appendCodeblock(header);

            if (documentation) {
              help.appendMarkdown(`---\n${documentation}`);
            }

            return new vscode.Hover(help, symbol.range);
          }
        }

        const property = assemblyLine.properties.find(p => p.range.contains(position));
        if (property) {
          const help = new vscode.MarkdownString();
          const parentName = property.parent ? `${property.parent.text}.` : '';

          help.appendCodeblock(
            `(${convertTokenToName(property.semanticToken)}) ${parentName}${property.text}`);

          const symbol = symbolManager.implementations.find(i => i.text === property.text);
          if (symbol?.documentation) {
            help.appendMarkdown(`---\n${symbol.documentation}`);
          }

          return new vscode.Hover(help, property.range);
        }
      }
    }
  }
}
