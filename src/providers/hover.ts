import * as vscode from 'vscode';
import { ConfigurationManager, HoverVerbosity } from '../managers/configuration';
import { WorkspaceManager } from '../managers/workspace';
import { DocOpcodeType } from '../parsers/docs';

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
                help.appendCodeblock(`(${DocOpcodeType[opcode.type]}) ${opcode.name} (${opcode.processor === '6809' ? '6809/6309' : '6309'}) ${opcode.summary}`);
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

            if (assemblyLine.label && range.intersection(assemblyLine.labelRange)) {
              const definitions = symbolManager.findDefinitionsByName(assemblyLine.label);
              if (definitions.length > 0) {
                const definition = definitions[0]; // more than one, pick first
                const help = new vscode.MarkdownString();
                help.appendCodeblock(`(${vscode.CompletionItemKind[definition.kind]}) ${definition.name}`);
                resolve(new vscode.Hover(help, assemblyLine.labelRange));
                return;
              }
            }

            if (assemblyLine.references.length > 0) {
              assemblyLine.references.filter(r => range.intersection(r.range)).forEach(reference => {
                const references = symbolManager.findDefinitionsByName(reference.name);
                if (references.length > 0) {
                  const reference = references[0]; // more than one, pick first
                  const help = new vscode.MarkdownString();
                  let summary = `(${vscode.CompletionItemKind[reference.kind]}) ${reference.name}`;
                  if (reference.kind==vscode.CompletionItemKind.Constant) {
                    summary += ` [${reference.value}]`;
                  }
                  help.appendCodeblock(summary);
                  help.appendMarkdown(`---\n${reference.documentation}`);
                  resolve(new vscode.Hover(help, range));
                  return;
                }
              });
            }
          }
        }

        reject();
      }
    });
  }
}
