import * as vscode from 'vscode';
import * as path from 'path';
import { Logger } from '../logger';

export enum DocOpcodeType { unknown, opcode, pseudo }

export class DocOpcode {
  public name = '';
  public processor = '';
  public conditionCodes = '';
  public summary = '';
  public notation = '';
  public documentation = '';
  public type = DocOpcodeType.unknown;

  public static parse(line: string, type: DocOpcodeType): DocOpcode | null {
    const columns = line.replace(/\!/g, '\n').split('\t');

    if (type === DocOpcodeType.opcode && columns.length > 5) {
      const opcode = new DocOpcode();
      
      opcode.name = columns[0];
      opcode.processor = columns[1];
      opcode.conditionCodes = columns[2];
      opcode.summary = columns[3];
      opcode.notation = columns[4];
      opcode.documentation = columns[5];

      return opcode;
    }
    
    if (type === DocOpcodeType.pseudo && columns.length > 2) {
      const opcode = new DocOpcode();

      opcode.name = columns[0];
      opcode.summary = columns[1];
      opcode.documentation = columns[2];

      return opcode;
    }

    return null;
  }
}

export class Docs {
  private readonly docsPath = 'docs';
  private readonly opcodesFile = 'opcodes.tsv';
  private readonly pseudoOpsFile = 'pseudo-ops.tsv';
  private opcodes = new Map<string, DocOpcode>();

  constructor(private extensionPath: string) {
  }

  public async init(): Promise<void> {
    const opcodesFilePath = path.join(this.extensionPath, this.docsPath, this.opcodesFile);
    await this.parse(opcodesFilePath, DocOpcodeType.opcode);

    const pseudoOpsFilePath = path.join(this.extensionPath, this.docsPath, this.pseudoOpsFile);
    await this.parse(pseudoOpsFilePath, DocOpcodeType.pseudo);
  }

  public findOpcode(startsWith: string): DocOpcode[] {
    return [...this.opcodes]
      .filter(opcode => opcode[1].name.startsWith(startsWith)).map(opcode => opcode[1]);
  }

  public getOpcode(name: string | undefined): DocOpcode | undefined {
    return name
      ? this.opcodes.get(name.toUpperCase())
      : undefined;
  }

  private async parse(filePath: string, type: DocOpcodeType): Promise<void> {
    const uri = vscode.Uri.file(filePath);
    const content = (await vscode.workspace.fs.readFile(uri)).toString();
    const lines = content.split(/\r\n|\r|\n/g);

    let lineNumber = 0;
    for (const line of lines) {
      if (lineNumber++ === 0) {
        // header row
        continue;
      }

      if (line.length > 0) {
        const opcode = DocOpcode.parse(line, type);

        if (opcode) {
          opcode.type = type;
          const key = opcode.name.toUpperCase();
          this.opcodes.set(key, opcode);
        } else {
          Logger.error(`Internal: \'${this.opcodesFile}\':${lineNumber} Cannot parse line.`);
        }
      }

      lineNumber += 1;
    }
  }
}
