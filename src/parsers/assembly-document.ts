import * as vscode from 'vscode';

import { AssemblyBlock } from './assembly-block';
import { AssemblyFileReference } from './assembly-file-reference';
import { AssemblyLine, ParserState } from './assembly-line';
import { appendPath, isTextDocument, isUri } from '../common';
import { SymbolManager } from '../managers';
import { Logger } from '../logger';

export class AssemblyDocument {
  public uri: vscode.Uri;
  public lines: AssemblyLine[] = [];
  public referencedDocuments: AssemblyFileReference[] = [];
  public blocks: Map<number, AssemblyBlock> = new Map<number, AssemblyBlock>();

  private constructor(
    document: vscode.TextDocument | vscode.Uri,
    private symbolManager: SymbolManager) {

    this.uri = isTextDocument(document) ? document.uri : document;
  }

  public static async create(
    document: vscode.TextDocument | vscode.Uri,
    symbolManager: SymbolManager,
    cancelationToken?: vscode.CancellationToken): Promise<AssemblyDocument | undefined> {  

    const assemblyDocument = new AssemblyDocument(document, symbolManager);
    const result = await assemblyDocument.parse(document, cancelationToken);
    return result ? assemblyDocument : undefined;
  }

  private processSymbols(line: AssemblyLine): void {
    if (line.label) {
      this.symbolManager.addImplementation(line.label);
    }

    if (line.file) {
      const uri = appendPath(this.uri, line.file); // TODO: Handle absolute paths and Windows paths
      if (!this.referencedDocuments.find(d => d.uri.toString() === uri.toString())) {
        this.referencedDocuments.push(new AssemblyFileReference(uri, line.fileRange!));
      }
    }

    if (line.references.length > 0) {
      line.references.forEach(this.symbolManager.addReference.bind(this.symbolManager));
    }

    if (line.properties.length > 0) {
      line.properties.forEach(this.symbolManager.addReference.bind(this.symbolManager));
    }

    if (line.type) {
      this.symbolManager.addReference(line.type);
    }
  }

  private async parse(
    document: vscode.TextDocument | vscode.Uri,
    cancelationToken?: vscode.CancellationToken): Promise<boolean> {

    let lines: string[] = [];
    
    if (isTextDocument(document)) {
      lines = document.getText().split(/\r?\n/);
    } else if (isUri(document)) {
      try {
        const content = await vscode.workspace.fs.readFile(document);
        lines = content.toString().split(/\r?\n/);
      } catch (error) {
        Logger.error(`Failed to read file: ${document.toString()}`);
        return false;
      }
    }

    const range = new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(lines.length - 1, 0));

    this.symbolManager.clearDocument(this.uri);
    let blockNumber = 1;
    let block = new AssemblyBlock(blockNumber, 0);
    this.blocks.set(blockNumber, block);

    let state: ParserState = {
      lonelyLabels: [],
      blockNumber: 1,
      struct: undefined,
      macro: undefined
    };

    for (let i = range.start.line; i <= range.end.line; i++) {
      if (cancelationToken && cancelationToken.isCancellationRequested) {
        return false;
      }

      const line = lines[i];
      const asmLine = new AssemblyLine(this.uri, line, state, i);
      this.lines.push(asmLine);

      state = asmLine.state;
      
      if (state.blockNumber > blockNumber) {
        block.endLineNumber = i - 1;

        if (block.endLineNumber - block.startLineNumber > 0) {
          this.blocks.set(blockNumber, block);
        }
        
        block = new AssemblyBlock(state.blockNumber, i + 1);
        blockNumber = state.blockNumber;
      }

      this.processSymbols(asmLine);
    }
    Logger.debug(`Parsed assembly document: ${this.uri.toString()}`);
    return true;
  }
}
