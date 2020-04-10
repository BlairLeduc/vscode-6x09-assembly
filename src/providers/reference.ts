import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';
import * as parser from '../parsers/assembly-document';

export class ReferenceProvider implements vscode.ReferenceProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideReferences(document: vscode.TextDocument, position: vscode.Position, context: vscode.ReferenceContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location[]> {
    return new Promise((resolve, reject) => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);

        if (!token.isCancellationRequested) {
          const word = document.getText(range);
          const assemblyLine = assemblyDocument.lines[position.line];

          if (assemblyLine.label && range.intersection(assemblyLine.labelRange)) {
            resolve(this.findReferences(assemblyDocument, word, context.includeDeclaration, document.uri));
            return;
          }

          if (assemblyLine.opcode && range.intersection(assemblyLine.opcodeRange)) {
            resolve(this.findReferences(assemblyDocument, word, context.includeDeclaration, document.uri));
            return;
          }

          if (assemblyLine.operand && range.intersection(assemblyLine.operandRange)) {
            resolve(this.findReferences(assemblyDocument, word, context.includeDeclaration, document.uri));
            return;
          }
        }

        reject();
      }
    });
  }

  private findReferences(assemblyDocument: parser.AssemblyDocument, word: string, includeDeclaration: boolean, uri: vscode.Uri): vscode.Location[] {
    return assemblyDocument.findReferences(word, includeDeclaration).map(s => new vscode.Location(uri, s.range));
  }

}
