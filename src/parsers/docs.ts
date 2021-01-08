import * as fs from 'fs';
import * as path from 'path';

export enum DocOpcodeType { unknown, opcode, pseudo }

export class DocOpcode {
  public name = '';
  public processor = '';
  public conditionCodes = '';
  public summary = '';
  public arithmetic = '';
  public documentation = '';
  public type = DocOpcodeType.unknown;

  public static parse(line: string, type: DocOpcodeType): DocOpcode {
    const columns = line.replace(/\!/g, '\n').split(';');
    if (columns.length > 1) {
      const opcode = new DocOpcode();
      if (type == DocOpcodeType.opcode) {
        opcode.name = columns[0];
        opcode.processor = columns[1];
        opcode.conditionCodes = columns[2];
        opcode.summary = columns[3];
        opcode.arithmetic = columns[4];
        opcode.documentation = columns[5];
      } else {
        opcode.name = columns[0];
        opcode.summary = columns[1];
        opcode.documentation = columns[2];
      }
      return opcode;
    }
    return null;
  }
}

export class Docs {
  private readonly docsPath = 'docs';
  private readonly opcodesFile = 'opcodes.csv';
  private readonly pseudoOpsFile = 'pseudo-ops.csv';
  private opcodes = new Map<string, DocOpcode>();

  constructor(extensionPath: string) {
    const opcodesFilePath = path.join(extensionPath, this.docsPath, this.opcodesFile);
    this.parse(opcodesFilePath, DocOpcodeType.opcode);

    const pseudoOpsFilePath = path.join(extensionPath, this.docsPath, this.pseudoOpsFile);
    this.parse(pseudoOpsFilePath, DocOpcodeType.pseudo);
  }

  public findOpcode(startsWith: string): DocOpcode[] {
    return [...this.opcodes].filter(opcode => opcode[1].name.startsWith(startsWith)).map(opcode => opcode[1]);
  }

  public getOpcode(name: string): DocOpcode {
    return this.opcodes.get(name.toUpperCase());
  }

  private parse(filePath: string, type: DocOpcodeType): void {
    const lines = fs.readFileSync(filePath, 'utf8').split(/\r\n|\r|\n/g);

    let lineNumber = 0;
    for (const line of lines) {
      if (line.length > 0) {
        const opcode = DocOpcode.parse(line, type);
        if (opcode) {
          opcode.type = type;
          const key = opcode.name.toUpperCase();
          this.opcodes.set(key, opcode);
        } else {
          // tslint:disable-next-line: no-console
          console.error(`\'${this.opcodesFile}\':${lineNumber} Cannot parse line.`);
        }
      }
      lineNumber += 1;
    }
  }
}
