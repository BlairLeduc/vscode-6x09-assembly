import { CancellationToken, CompletionItemKind, Hover, MarkdownString, Position, ProviderResult, TextDocument } from 'vscode';
import { ConfigurationManager, HelpVerbosity } from '../managers/configuration';
import { WorkspaceManager } from '../managers/workspace';
import { DocOpcodeType } from '../parsers/docs';

const kindMap = new Map<CompletionItemKind, string>([
  [ CompletionItemKind.Class, 'routine' ],
  [ CompletionItemKind.Function, 'label' ],
  [ CompletionItemKind.Method, 'macro' ],
  [ CompletionItemKind.Constant, 'constant' ],
  [ CompletionItemKind.Variable, 'variable' ],
  [ CompletionItemKind.Struct, 'struct' ],
  [ CompletionItemKind.File, 'file' ],
  [ CompletionItemKind.Value, 'value'],
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
  
          const symbol = assemblyLine.tokens.find(t => t.range.contains(position));
          if (symbol.kind === CompletionItemKind.Keyword) {
            const opcodeDocs = this.workspaceManager.opcodeDocs.getOpcode(symbol.text);
            if (opcodeDocs) {
              const help = new MarkdownString();
              let processorSpec = ' -';
              if (opcodeDocs.type === DocOpcodeType.opcode) {
                processorSpec = opcodeDocs.processor === '6809' ? ' (6809/6309)' : ' (6309)';
              }
              help.appendCodeblock(`(${DocOpcodeType[opcodeDocs.type]}) ${symbol.text}${processorSpec} ${opcodeDocs.summary}`);
              let documentation = opcodeDocs.conditionCodes;
              if (this.configurationManager.helpVerbosity === HelpVerbosity.full && opcodeDocs.documentation) {
                if (opcodeDocs.conditionCodes) {
                  documentation += '  \n  \n';
                }
                documentation += opcodeDocs.documentation;
              }
              if (documentation) {
                help.appendMarkdown('---\n' + documentation);
              }
              resolve(new Hover(help, symbol.range));
              return;
            }
          } else if (symbol.kind !== CompletionItemKind.Operator) {
            const kind = symbol.parent ? symbol.parent.kind : symbol.kind;
            const kindName = this.kindToString(kind);
            if (kindName) { // Only show if it is a kind we want to show
              const documentation = symbol.parent ? symbol.parent.documentation : symbol.documentation;
              const value = symbol.parent ? symbol.parent.value : symbol.value;
              let header = `(${kindName}) ${symbol.text}`;
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
