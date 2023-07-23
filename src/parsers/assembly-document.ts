import * as vscode from 'vscode';
import { AssemblyLine, ParserState } from './assembly-line';
import { AssemblyBlock, AssemblyFileReference, appendPath, isTextDocument, isUri } from '../common';
import { SymbolManager } from '../managers/symbol';
import { Logger } from '../logger';

export class AssemblyDocument {
  public uri: vscode.Uri;
  public lines: AssemblyLine[] = new Array<AssemblyLine>();
  public referencedDocuments: AssemblyFileReference[] = new Array<AssemblyFileReference>();
  public blocks: Map<number, AssemblyBlock> = new Map<number, AssemblyBlock>();

  private constructor(
    document: vscode.TextDocument | vscode.Uri,
    private symbolManager: SymbolManager) {

    this.uri = isTextDocument(document) ? document.uri : document;
  }

  public static async create(
    document: vscode.TextDocument | vscode.Uri,
    symbolManager: SymbolManager,
    cancelationToken?: vscode.CancellationToken): Promise<AssemblyDocument> {  

    const assemblyDocument = new AssemblyDocument(document, symbolManager);
    await assemblyDocument.parse(document, cancelationToken);
    return assemblyDocument;
  }

  private processSymbols(line: AssemblyLine): void {
    if (line.label) {
      this.symbolManager.addImplementation(line.label);
    }

    if (line.file) {
      const uri = appendPath(this.uri, line.file); // TODO: Handle absolute paths and Windows paths
      if (!this.referencedDocuments.find(d => d.uri)) {
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
    cancelationToken?: vscode.CancellationToken): Promise<void> {

    let lines: string[] = [];
    if (isTextDocument(document)) {
      lines = document.getText().split(/\r?\n/);
    } else if (isUri(document)) {
      const content = await vscode.workspace.fs.readFile(document);
      lines = content.toString().split(/\r?\n/);
    }

    if (lines.length === 0) {
      return;
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
        return;
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
  }
}
