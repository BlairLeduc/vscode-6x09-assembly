import * as fs from 'fs';
import * as path from 'path';
import { AssemblyDocument } from './assembly-document';
import { ListingLine } from './listing-line';

export class MachineCode {
  public address: number;
  public code: number[];
}
export class AssemblyListing {

  private sourceFile: string;

  constructor(private document: AssemblyDocument, listingFile: string) {
    const lines = fs.readFileSync(listingFile).toString().split('\n');
    this.sourceFile = path.basename(this.document.uri.path);
    this.parse(lines);
  }

  private parse(rawLines: string[]): void {
    if (rawLines.length === 0) {
      return;
    }

    let lastLine: ListingLine;
    rawLines.forEach(rawLine => {
      const line = new ListingLine(rawLine);
      if (line.continuation && lastLine) {
        lastLine.value += line.value;
      }
      if (line.file === this.sourceFile) {
        if (line.lineNumber > 0) {
          line.assemblyLine = this.document.lines.find(dl => dl.lineNumber === line.lineNumber);
          lastLine = line;
        }
      }
    });
  }
}
