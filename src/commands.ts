import { TextEditor, TextEditorEdit } from 'vscode';
import { OpcodeCase } from './managers/configuration';
import { WorkspaceManager } from './managers/workspace';
import { AssemblyLine } from './parsers/assembly-line';
import { convertToCase } from './utilities';

export class ChangeCaseOpcodeCommand {

  constructor(private workspaceManager: WorkspaceManager, private casing: OpcodeCase) {}

  public handler(textEditor: TextEditor, edit: TextEditorEdit): void {
    const assemblyDocument = this.workspaceManager.getAssemblyDocument(textEditor.document, undefined);
    const symbolsManager = this.workspaceManager.getSymbolManager(textEditor.document);

    assemblyDocument.lines.forEach((line: AssemblyLine) => {
      if (line.opcode && !symbolsManager.findMacro(line.opcode).length) {
        edit.replace(line.opcodeRange, convertToCase(line.opcode, this.casing));
      }
    });
  }
}
