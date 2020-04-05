import { TextEditor, TextEditorEdit } from 'vscode';
import { OpcodeCase } from './managers/configuration';
import { AssemblyLine } from './parsers/assembly-line';
import { convertToCase } from './utilities';
import { WorkspaceManager } from './managers/workspace';

export class ChangeCaseOpcodeCommand {

  constructor(private workspaceManager: WorkspaceManager, private casing: OpcodeCase) {}

  public handler(textEditor: TextEditor, edit: TextEditorEdit): void {
    const assemblyDocument = this.workspaceManager.getAssemblyDocument(textEditor.document);

    assemblyDocument.lines.forEach((line: AssemblyLine) => {
      if (line.opcode && !assemblyDocument.findMacro(line.opcode).length) {
        edit.replace(line.opcodeRange, convertToCase(line.opcode, this.casing));
      }
    });
  }
}
