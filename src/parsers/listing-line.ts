import { AssemblyLine } from './assembly-line';

export class ListingLine {

  public address = -1;
  public value = '';
  public lineNumber = -1;
  public file = '';
  public continuation = false;
  public assemblyLine?: AssemblyLine;

  constructor(private rawLine: string) {
    this.parse();
  }

  private parse(): void {
    if (this.rawLine.length < 47) {
      if (this.rawLine.startsWith('    ')) {
        this.continuation = true;
        this.value = this.rawLine.trim();
      }
      return;
    }

    const addressStr = this.rawLine.substring(0, 5);
    if (addressStr.trim().length > 0) {
      this.address = Number.parseInt(addressStr, 16);
    }

    this.value = this.rawLine.substring(5, 21).trim();
    this.file = this.rawLine.substring(23, 40).trim();
    this.lineNumber = Number.parseInt(this.rawLine.substring(42, 47), 10);
  }
}
