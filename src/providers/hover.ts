import * as vscode from 'vscode';
import { convertTokenToName, TokenType } from '../common';
import { ConfigurationManager, HelpVerbosity } from '../managers/configuration';
import { WorkspaceManager } from '../managers/workspace';
import { DocOpcodeType } from '../parsers/docs';

const kindMap = new Map<vscode.CompletionItemKind, string>([
  [vscode.CompletionItemKind.Class, 'routine'],
  [vscode.CompletionItemKind.Function, 'label'],
  [vscode.CompletionItemKind.Method, 'macro'],
  [vscode.CompletionItemKind.Struct, 'struct'],
  [vscode.CompletionItemKind.Constant, 'constant'],
  [vscode.CompletionItemKind.Variable, 'variable'],
  [vscode.CompletionItemKind.Property, 'property'],
]);

export class HoverProvider implements vscode.HoverProvider {

  constructor(private workspaceManager: WorkspaceManager, private configurationManager: ConfigurationManager) {
  }

  public provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
    return new Promise((resolve, reject) => {
      if (this.configurationManager.helpVerbosity !== HelpVerbosity.none) {
        const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);

        if (!token.isCancellationRequested) {
          const assemblyLine = assemblyDocument.lines[position.line];

          if (assemblyLine.opCodeRange && assemblyLine.opCodeRange.contains(position)) {
            const opCode = assemblyLine.opCode;
            const opCodeDocs = this.workspaceManager.opcodeDocs.getOpcode(opCode.text);
            if (opCodeDocs) {
              const help = new vscode.MarkdownString();
              let processorSpec = ' -';
              if (opCodeDocs.type === DocOpcodeType.opcode) {
                processorSpec = opCodeDocs.processor === '6809' ? ' (6809/6309)' : ' (6309)';
              }
              help.appendCodeblock(`(${DocOpcodeType[opCodeDocs.type]}) ${opCode.text}${processorSpec} ${opCodeDocs.summary}`);
              let documentation = opCodeDocs.type === DocOpcodeType.opcode ? `${opCodeDocs.notation}　⸺　${opCodeDocs.conditionCodes}` : '';
              if (this.configurationManager.helpVerbosity === HelpVerbosity.full && opCodeDocs.documentation) {
                documentation += `  \n  \n${opCodeDocs.documentation}`;
              }
              if (documentation) {
                help.appendMarkdown('---\n' + documentation);
              }
              resolve(new vscode.Hover(help, assemblyLine.opCodeRange));
              return;
            }
          }

          if (assemblyLine.typeRange && assemblyLine.typeRange.contains(position)) {
            const type = assemblyLine.type;
            const help = new vscode.MarkdownString();
            help.appendCodeblock(`(${type.type === TokenType.macro ? 'macro' : 'struct'}) ${type.text}`);
            resolve(new vscode.Hover(help, assemblyLine.opCodeRange));
            return;
          }

          const symbol = assemblyLine.references.find(r => r.range.contains(position)) ?? assemblyLine.label;
          if (symbol && symbol.range.contains(position)) {
            const documentation = symbol.definition ? symbol.definition.documentation : symbol.documentation;
            const value = symbol.definition ? symbol.definition.value : symbol.value;
            let header = `(${convertTokenToName(symbol.semanticToken)}) ${symbol.text}`;
            if (value) {
              header += ` ${value}`;
            }
            const help = new vscode.MarkdownString();

            help.appendCodeblock(header);
            if (documentation) {
              help.appendMarkdown(`---\n${documentation}`);
            }
            resolve(new vscode.Hover(help, symbol.range));
            return;
          }
        } else {
          reject(null);
          return;
        }
      }
      resolve(null);
    });
  }

  private kindToString(kind: vscode.CompletionItemKind): string {
    if (kindMap.has(kind)) {
      return kindMap.get(kind);
    }
    return null;
  }
}
