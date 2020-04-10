import * as vscode from 'vscode';
import { ConfigurationManager, HoverVerbosity } from '../managers/configuration';
import { WorkspaceManager } from '../managers/workspace';

export class HoverProvider implements vscode.HoverProvider {

  constructor(private workspaceManager: WorkspaceManager, private configurationManager: ConfigurationManager) {
  }
  public provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
    return new Promise((resolve, reject) => {
      if (this.configurationManager.hoverVerbosity !== HoverVerbosity.none) {
        const range = document.getWordRangeAtPosition(position);

        if (range) {
          const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);

          if (!token.isCancellationRequested) {
            const assemblyLine = assemblyDocument.lines[position.line];

            if (assemblyLine.opcode && range.intersection(assemblyLine.opcodeRange)) {
              const opcode = this.workspaceManager.opcodeDocs.getOpcode(assemblyLine.opcode);
              if (opcode) {
                const help = new vscode.MarkdownString();
                help.appendCodeblock(`(opcode) ${opcode.name} (${opcode.processor === '6809' ? '6809/6309' : '6309'}) ${opcode.summary}`);
                if (this.configurationManager.hoverVerbosity === HoverVerbosity.full) {
                  help.appendMarkdown(`---\n${opcode.documentation}`);
                }
                resolve(new vscode.Hover(help, assemblyLine.opcodeRange));
                return;
              }
              const macro = assemblyDocument.getMacro(assemblyLine.opcode);
              if (macro) {
                const help = new vscode.MarkdownString();
                help.appendCodeblock(`(macro) ${macro.name}`);
                help.appendMarkdown(`---\n${macro.documentation}`);
                resolve(new vscode.Hover(help, assemblyLine.opcodeRange));
                return;
              }
            }

            if (assemblyLine.reference && range.intersection(assemblyLine.referenceRange)) {
              const symbol = assemblyDocument.getSymbol(assemblyLine.reference);
              if (symbol) {
                const help = new vscode.MarkdownString();
                help.appendCodeblock(`(symbol) ${symbol.name}`);
                help.appendMarkdown(`---\n${symbol.documentation}`);
                resolve(new vscode.Hover(help, assemblyLine.referenceRange));
                return;
              }
            }
          }
        }

        reject();
      }
    });
  }
}
