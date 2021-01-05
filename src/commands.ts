import { CompletionItemKind, TextEditor, TextEditorEdit } from 'vscode';
import { OpcodeCase } from './managers/configuration';
import { WorkspaceManager } from './managers/workspace';
import { AssemblyLine } from './parsers/assembly-line';
import { convertToCase } from './utilities';

export class ChangeCaseOpcodeCommand {

  constructor(private workspaceManager: WorkspaceManager, private casing: OpcodeCase) {}

  public handler(textEditor: TextEditor, edit: TextEditorEdit): void {
    const assemblyDocument = this.workspaceManager.getAssemblyDocument(textEditor.document, undefined);

    assemblyDocument.lines.forEach((line: AssemblyLine) => {
      const opcodeToken = line.tokens.find(t => t.kind === CompletionItemKind.Keyword);
      if (opcodeToken) {
        edit.replace(opcodeToken.range, convertToCase(opcodeToken.text, this.casing));
      }
    });
  }
}
