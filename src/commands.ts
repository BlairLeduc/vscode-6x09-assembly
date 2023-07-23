import * as vscode from 'vscode';
import { TokenKind } from './common';
import { OpcodeCase } from './managers/configuration';
import { WorkspaceManager } from './managers/workspace';
import { AssemblyLine } from './parsers/assembly-line';
import { convertToCase } from './utilities';
import { Logger } from './logger';

export class ChangeCaseOpcodeCommand {

  constructor(private workspaceManager: WorkspaceManager, private casing: OpcodeCase) { }

  public handler(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit): void {
    const assemblyDocument = this.workspaceManager.getAssemblyDocument(textEditor.document);

    if (assemblyDocument) {
      assemblyDocument.lines.forEach((line: AssemblyLine) => {
        const opCode = line.opCode;
        if (opCode && opCode.kind === TokenKind.opCode) {
          edit.replace(
            new vscode.Range(
              line.lineNumber,
              opCode.char,
              line.lineNumber,
              opCode.char + opCode.length),
            convertToCase(opCode.text, this.casing));
            Logger.info(`Changed opcode case to ${OpcodeCase[this.casing]}`);
        }
      });
    }
  }
}