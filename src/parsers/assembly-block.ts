import * as vscode from 'vscode';

import { AssemblySymbol } from './assembly-symbol';

export class AssemblyBlock {
  public endLineNumber: number;
  public foldingRangeKind?: vscode.FoldingRangeKind;

  constructor(
    public number: number,
    public startLineNumber: number,
    public label?: AssemblySymbol,
    public symbols: AssemblySymbol[] = [],
  ) {
    this.endLineNumber = startLineNumber;
  }
}

