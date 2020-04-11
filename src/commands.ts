import { TextEditor, TextEditorEdit } from 'vscode';
import { ConfigurationManager, OpcodeCase } from './managers/configuration';
import { WorkspaceManager } from './managers/workspace';
import { AssemblyLine } from './parsers/assembly-line';
import { convertToCase, execCmd } from './utilities';
import { ChildProcess } from 'child_process';

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

export class StartEmulatorCommand {

  constructor(private configurationManager: ConfigurationManager) {
  }
  public async handler(): Promise<ChildProcess> {
    return await execCmd(
      '/Applications/XRoar.app/Contents/MacOS/xroar',
      [
        // '-becker',
        '-machine-desc',
        'cocous',
        '-vdg-type',
        '6847t1',
      ],
      '.'
    );
  }
}
