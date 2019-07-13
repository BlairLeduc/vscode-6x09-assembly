import * as vscode from 'vscode';
import * as parser from './parser';
import { AssemblyWorkspaceManager } from './workspace-manager';

export class ReferenceProvider implements vscode.ReferenceProvider {

  constructor(private workspaceManager: AssemblyWorkspaceManager) {
  }

  public provideReferences(document: vscode.TextDocument, position: vscode.Position, context: vscode.ReferenceContext, token: vscode.CancellationToken): Promise<vscode.Location[]> {
    return new Promise((resolve, reject) => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const word = document.getText(range);
        const assemblyDocument = this.workspaceManager.getAssemblyDocument(document);
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
    });
  }

  private findReferences(assemblyDocument: parser.AssemblyDocument, word: string, includeDeclaration: boolean, uri: vscode.Uri) {
    return assemblyDocument.findReferences(word, includeDeclaration).map(s => new vscode.Location(uri, s.range));
  }

}
