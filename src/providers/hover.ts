import { CancellationToken, CompletionItemKind, Hover, MarkdownString, Position, ProviderResult, TextDocument } from 'vscode';
import { ConfigurationManager, HoverVerbosity } from '../managers/configuration';
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
      if (this.configurationManager.hoverVerbosity !== HoverVerbosity.none) {
        const range = document.getWordRangeAtPosition(position);

        if (range) {
          const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);

          if (!token.isCancellationRequested) {
            const assemblyLine = assemblyDocument.lines[position.line];
            const token = assemblyLine.tokens.find(t => range.intersection(t.range) && t.kind != CompletionItemKind.Operator);
            
            if (token.kind === CompletionItemKind.Keyword) {
              const opcodeDocs = this.workspaceManager.opcodeDocs.getOpcode(token.text);
              if (opcodeDocs) {
                const help = new MarkdownString();
                let processorSpec = ' -';
                if (opcodeDocs.type === DocOpcodeType.opcode) {
                  processorSpec = opcodeDocs.processor === '6809' ? ' (6809/6309)' : ' (6309)';
                }
                help.appendCodeblock(`(${DocOpcodeType[opcodeDocs.type]}) ${token.text}${processorSpec} ${opcodeDocs.summary}`);
                if (this.configurationManager.hoverVerbosity === HoverVerbosity.full && opcodeDocs.documentation) {
                  help.appendMarkdown(`---\n${opcodeDocs.documentation}`);
                }
                resolve(new Hover(help, assemblyLine.opcodeRange));
              }
            } else {
              const kind = token.parent ? token.parent.kind : token.kind;
              const kindName = this.kindToString(kind);
              if (kindName) { // Only show if it is a kind we want to show
                const documentation = token.parent ? token.parent.documentation : token.documentation;
                const value = token.parent ? token.parent.value : token.value;
                let header = `(${kindName}) ${token.text}`;
                if (value) {
                  header += ` ${value}`;
                }
                const help = new MarkdownString();

                help.appendCodeblock(header);
                if (documentation) {
                  help.appendMarkdown(`---\n${documentation}`);
                }
                resolve(new Hover(help, token.range));
              }
            }  
          }
        } else {
          reject();
        }
      }
    });
  }

  private kindToString(kind: CompletionItemKind): string {
    if (kindMap.has(kind)) {
      return kindMap.get(kind);
    }
    return null;
  }
}
