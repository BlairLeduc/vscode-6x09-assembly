import { CancellationToken, CompletionItemKind, Hover, MarkdownString, Position, ProviderResult, TextDocument } from 'vscode';
import { convertTokenToName } from '../common';
import { ConfigurationManager, HelpVerbosity } from '../managers/configuration';
import { WorkspaceManager } from '../managers/workspace';
import { DocOpcodeType } from '../parsers/docs';

const kindMap = new Map<CompletionItemKind, string>([
  [CompletionItemKind.Class, 'routine'],
  [CompletionItemKind.Function, 'label'],
  [CompletionItemKind.Method, 'macro'],
  [CompletionItemKind.Struct, 'struct'],
  [CompletionItemKind.Constant, 'constant'],
  [CompletionItemKind.Variable, 'variable'],
  [CompletionItemKind.Property, 'property'],
]);
export class HoverProvider implements HoverProvider {

  constructor(private workspaceManager: WorkspaceManager, private configurationManager: ConfigurationManager) {
  }

  public provideHover(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Hover> {
    return new Promise((resolve, reject) => {
      if (this.configurationManager.helpVerbosity !== HelpVerbosity.none) {
        const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);

        if (!token.isCancellationRequested) {
          const assemblyLine = assemblyDocument.lines[position.line];

          if (assemblyLine.opCodeRange && assemblyLine.opCodeRange.contains(position)) {
            const opCode = assemblyLine.opCode;
            const opCodeDocs = this.workspaceManager.opcodeDocs.getOpcode(opCode.text);
            if (opCodeDocs) {
              const help = new MarkdownString();
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
              resolve(new Hover(help, assemblyLine.opCodeRange));
              return;
            }
          }
          const symbol = assemblyLine.references.find(r => r.range.contains(position)) ?? assemblyLine.label;
          if (symbol && symbol.range.contains(position)) {
            const documentation = symbol.definition ? symbol.definition.documentation : symbol.documentation;
            const value = symbol.definition ? symbol.definition.value : symbol.value;
            let header = `(${convertTokenToName(symbol.semanticToken)}) ${symbol.text}`;
            if (value) {
              header += ` ${value}`;
            }
            const help = new MarkdownString();

            help.appendCodeblock(header);
            if (documentation) {
              help.appendMarkdown(`---\n${documentation}`);
            }
            resolve(new Hover(help, symbol.range));
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

  private kindToString(kind: CompletionItemKind): string {
    if (kindMap.has(kind)) {
      return kindMap.get(kind);
    }
    return null;
  }
}
