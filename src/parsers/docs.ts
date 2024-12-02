import * as vscode from 'vscode';
import { Logger } from '../logger';

export enum DocOpcodeType { unknown, functions, opcode, pseudo }

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
    
    if ((type === DocOpcodeType.pseudo || type === DocOpcodeType.functions) && columns.length > 1) {
      const opcode = new DocOpcode();

      opcode.name = columns[0];
      opcode.summary = columns[1];

      return opcode;
    }

    return null;
  }
}

export class Docs {
  private readonly docsPath = 'docs';
  private readonly functionsFile = 'functions.tsv';
  private readonly opcodesFile = 'opcodes.tsv';
  private readonly pseudoOpsFile = 'pseudo-ops.tsv';
  private opcodes = new Map<string, DocOpcode>();
  private functions = new Map<string, DocOpcode>();

  constructor(private extensionPath: string) {
  }

  public async init(): Promise<void> {
    const extensionUri = vscode.Uri.file(this.extensionPath);

    const opcodesUri = vscode.Uri.joinPath(extensionUri, this.docsPath, this.opcodesFile);
    await this.parse(opcodesUri, DocOpcodeType.opcode);

    const pseudoOpsUri = vscode.Uri.joinPath(extensionUri, this.docsPath, this.pseudoOpsFile);
    await this.parse(pseudoOpsUri, DocOpcodeType.pseudo);

    const functionsUri = vscode.Uri.joinPath(extensionUri, this.docsPath, this.functionsFile);
    await this.parse(functionsUri, DocOpcodeType.functions);
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

  public findFunction(startsWith: string): DocOpcode[] {
    return [...this.functions]
      .filter(symbol => symbol[1].name.startsWith(startsWith)).map(symbol => symbol[1]);
  }

  public getFunction(name: string | undefined): DocOpcode | undefined {
    return name
      ? this.functions.get(name.toUpperCase())
      : undefined;
  }

  private async parse(uri: vscode.Uri, type: DocOpcodeType): Promise<void> {
    const content = (await vscode.workspace.fs.readFile(uri)).toString();
    const lines = content.split(/\r\n|\r|\n/g);

    let lineNumber = 0;
    for (const line of lines) {
      if (lineNumber++ === 0) {
        // header row
        continue;
      }

      if (line.length > 0) {
        const symbol = DocOpcode.parse(line, type);

        if (symbol) {
          symbol.type = type;
          const key = symbol.name.toUpperCase();
          if (type === DocOpcodeType.functions) {
            this.functions.set(key, symbol);
          } else {
            this.opcodes.set(key, symbol);
          }
        } else {
          Logger.error(`Internal: \'${this.opcodesFile}\':${lineNumber} Cannot parse line.`);
        }
      }

      lineNumber += 1;
    }
  }
}
