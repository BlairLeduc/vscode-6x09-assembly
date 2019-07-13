import * as vscode from 'vscode';
import { AssemblyWorkspaceManager } from './workspace-manager';

export class HoverProvider implements vscode.HoverProvider {

  constructor(private workspaceManager: AssemblyWorkspaceManager) {
  }
  public provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
    return new Promise((resolve, reject) => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const word = document.getText(range);
        const assemblyDocument = this.workspaceManager.getAssemblyDocument(document);
        const assemblyLine = assemblyDocument.lines[position.line];

        if (assemblyLine.opcode && range.intersection(assemblyLine.opcodeRange)) {
          const opcode = this.workspaceManager.opcodeDocs.getOpcode(assemblyLine.opcode);
          if (opcode) {
            const help = new vscode.MarkdownString();
            help.appendCodeblock(`(opcode) ${opcode.name} (${opcode.processor === '6809' ? '6809/6309' : '6309'})`);
            help.appendMarkdown(`---\n${opcode.documentation}`);
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
          const reference = assemblyDocument.getReference(assemblyLine.reference);
          if (reference) {
            const help = new vscode.MarkdownString();
            help.appendCodeblock(`(symbol) ${reference.name}`);
            help.appendMarkdown(`---\n${reference.documentation}`);
            resolve(new vscode.Hover(help, assemblyLine.referenceRange));
            return;
          }
        }

        reject();
      }
    });
  }
}
