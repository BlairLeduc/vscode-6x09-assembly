import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';

export class RenameProvider implements vscode.RenameProvider {

  constructor(private workspaceManager: WorkspaceManager) { }

  public async provideRenameEdits(
    document: vscode.TextDocument,
    position: vscode.Position,
    newName: string,
    cancellationToken: vscode.CancellationToken): Promise<vscode.WorkspaceEdit | undefined> {

    if (!cancellationToken.isCancellationRequested) {
      const assemblyDocument = this.workspaceManager
        .getAssemblyDocument(document, cancellationToken);

      const symbolManager = this.workspaceManager.getSymbolManager(document);

      if (assemblyDocument && symbolManager) {
        const assemblyLine = assemblyDocument.lines[position.line];
        const reference = assemblyLine.references
          .find(r => r.range.contains(position)) ?? assemblyLine.label;
        
        if (reference && reference.uri && reference.range.contains(position)) {
          const references = symbolManager.references.filter(r => r.text === reference.text);
          const symbol = symbolManager.implementations.find(i => i.text === reference.text);

          if (symbol && symbol.uri) {
            const edit = new vscode.WorkspaceEdit();
            edit.replace(symbol.uri, symbol.range, newName);
            references.forEach(s => edit.replace(s.uri, s.range, newName));
            return edit;
          }
        }
      }
    }
  }

  public async prepareRename?(
    document: vscode.TextDocument,
    position: vscode.Position,
    cancellationToken: vscode.CancellationToken)
      : Promise<vscode.Range | { range: vscode.Range; placeholder: string; } | undefined> {

    if (!cancellationToken.isCancellationRequested) {
      const assemblyDocument = this.workspaceManager
        .getAssemblyDocument(document, cancellationToken);
      
      const symbolManager = this.workspaceManager.getSymbolManager(document);

      if (assemblyDocument && symbolManager) {
        const assemblyLine = assemblyDocument.lines[position.line];
        const symbol = assemblyLine.references
          .find(r => r.range.contains(position)) ?? assemblyLine.label;

        if (symbol && symbol.range.contains(position)) {
          return { range: symbol.range, placeholder: symbol.text };
        }
      }
    }
  }
}
