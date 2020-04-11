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
            const symbolManager = this.workspaceManager.getSymbolManager(document);

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
              const macro = symbolManager.getMacro(assemblyLine.opcode);
              if (macro) {
                const help = new vscode.MarkdownString();
                help.appendCodeblock(`(macro) ${macro.name}`);
                help.appendMarkdown(`---\n${macro.documentation}`);
                resolve(new vscode.Hover(help, assemblyLine.opcodeRange));
                return;
              }
            }

            if (assemblyLine.reference && range.intersection(assemblyLine.referenceRange)) {
              const definitions = symbolManager.findDefinitionsByName(assemblyLine.reference);
              if (definitions.length > 0) {
                const definition = definitions[0]; // more than one, pick first
                const help = new vscode.MarkdownString();
                help.appendCodeblock(`(symbol) ${definition.name}`);
                help.appendMarkdown(`---\n${definition.documentation}`);
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
