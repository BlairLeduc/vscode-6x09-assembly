import * as fs from 'fs';
import * as path from 'path';

export class DocOpcode {
  public static parse(line: string) {
    const columns = line.split(',');
    if (columns.length === 3) {
      const opcode = new DocOpcode();
      opcode.name = columns[0];
      opcode.documentation = columns[1];
      opcode.processor = columns[2];
      return opcode;
    }
    return null;
  }

  public name: string = '';
  public documentation: string = '';
  public processor: string = '';
}

export class Docs {
  private readonly docsPath = 'docs';
  private readonly opcodesFile = 'opcodes.csv';
  private opcodes = new Map<string, DocOpcode>();

  constructor(private extensionPath: string) {
    const filePath = path.join(extensionPath, this.docsPath, this.opcodesFile);
    const lines = fs.readFileSync(filePath, 'utf8').split(/\r\n|\r|\n/g);

    let lineNumber = 0;
    for (const line of lines) {
      if (line.length > 0) {
        const opcode = DocOpcode.parse(line);
        if (opcode) {
          const key = opcode.name.toUpperCase();
          this.opcodes.set(key, opcode);
        } else {
          // tslint:disable-next-line: no-console
          console.error(`\'${this.opcodesFile}\':${lineNumber} Cannot parse line, must be 3 columns.`);
        }
      }
      lineNumber += 1;
    }
  }
  public findOpcode(startsWith: string): DocOpcode[] {
    return [...this.opcodes].filter(opcode => opcode[1].name.startsWith(startsWith)).map(opcode => opcode[1]);
  }
}
