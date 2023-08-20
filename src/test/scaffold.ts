import * as path from 'path';
import { ASM6X09_LANGUAGE } from '../constants';

export class Disposable {
  dispose(): any { }
};

export interface Event<T> {
  (listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]): Disposable;
}

export class EventEmitter<T> extends Disposable {
  private handler: (e: T) => any = () => { };

  event: Event<T> = (listener: (e: T) => any, _thisArgs?: any, _disposables?: Disposable[]) => {
    this.handler = listener;
    return this;
  };

  async fire(data: T): Promise<void> {
    const result = this.handler(data);

    if(result && this.isPromise(result)) {
      await result;
    }
  }

  private isPromise<T>(obj: Promise<T>): obj is Promise<T> {
    return (obj as Promise<T>).then !== undefined;
  }
}

export class TextContent {
  private static readonly files: Map<string, string> = new Map([
    ['valid-docs-opcodes.tsv',
      'Name\tProcessor\tCondition\tCodes\tSummary\tNotation\tDocumentation\n' +
      'ABX\t6809\tH=• N=• Z=• V=• C=•\tAdd B into X (Unsigned)\tX\' ← X + B\tAdd the unsigned value in B into X.\n' +
      'ADCA\t6809\tH=↕ N=↕ Z=↕ V=↕ C=↕\tAdd Memory Byte with Carry into A\tA\' ← A + M + C\tAdd A, the C (carry) bit and the memory byte into A.\n'],
    ['valid-docs-pseudo-ops.tsv',
      'Name\tSummary\n' +
      'EQU\tSet a Symbol to a Value\n' +
      'FCB\tDefine Byte(s)\n'],
    ['valid-hello.asm',
      '  org $1000\n' +
      'start\n' +
      '  ldx #message\n' +
      '\n' +
      'loop\n' +
      '  lda ,x+\n' +
      '  beq done\n' +
      '  jsr $FFD2\n' +
      '  bra loop\n' +
      '\n' +
      'done\n' +
      '  rts\n' +
      '\n' +
      'message\n' +
      '  fcc "Hello, world!"\n' +
      '  fcb 0\n'],
    ['valid-refs.asm',
      ' include "6809-1.inc"\n' +
      'start\n' +
      ' ldx #$DEAD\n' +
      '\n' +
      'done\n' +
      ' rts\n'],
    ['valid-struct.asm',
      'things struct\n' +
      'one rmb 1\n' +
      'two rmb 1\n' +
      ' ends\n' +
      'test things\n' +
      ' lda #test.one\n'],
    ['valid-hello.txt',
      'Hello, world!\n'],
    ['invalid-docs-opcodes.tsv',
      'Name\tProcessor\tCondition\tCodes\tSummary\tNotation\tDocumentation\n' +
      'WNG'],
    ['invalid-docs-pseudo-ops.tsv',
      'Name\tSummary\tDocumentation\n' +
      'BAD']
  ]);
  static getFile(filename: string): string {
    return TextContent.files.get(filename.replace(/[\/]/g, '-')) || '';
  }
}

export interface TextDocumentRenameEvent {
  oldUri: Uri;
  newUri: Uri;
}

export class TextDocument {
  private onDidChangeEmitter = new EventEmitter<TextDocument>();
  private onDidCloseEmitter = new EventEmitter<TextDocument>();
  private onDidDeleteEmitter = new EventEmitter<Uri>();
  private onDidRenameEmitter = new EventEmitter<TextDocumentRenameEvent>();
  private content: string[] = [];

  onDidChange: Event<TextDocument> = this.onDidChangeEmitter.event;
  onDidClose: Event<TextDocument> = this.onDidCloseEmitter.event;
  onDidDelete: Event<Uri> = this.onDidDeleteEmitter.event;
  onDidRename: Event<TextDocumentRenameEvent> = this.onDidRenameEmitter.event;

  constructor(
    public readonly uri: Uri,
    public readonly fileName: string,
    public readonly languageId: string,
    public readonly version: number,
    public readonly isDirty: boolean,
    public readonly isUntitled: boolean,
    public readonly isClosed: boolean,
    public readonly eol: string,
    public readonly lineCount: number) {
  }

  static create(filename: string): TextDocument {
    const uri = Uri.file(filename);
    const text = TextContent.getFile(filename);
    const lines = text.toString().split(/\r?\n/);

    const document = new TextDocument(
      uri,
      filename,
      filename.endsWith('.asm') ? ASM6X09_LANGUAGE : 'plaintext',
      1,
      false,
      false,
      false,
      '\n',
      lines.length);

    document.putText(lines);

    return document;
  }

  putText(lines: string[]) {
    this.content = lines;
    this.onDidChangeEmitter.fire(this);
  }

  getText(): string {
    return this.content.join('\n');
  }

  close(): void {
    this.onDidCloseEmitter.fire(this);
  }

  delete(): void {
    this.onDidDeleteEmitter.fire(this.uri);
  }

  async rename(newUri: Uri): Promise<void> {
    const oldUri = this.uri;
    await this.onDidRenameEmitter.fire({oldUri, newUri});
  }
}

export class Uri {
  readonly scheme: string = 'file';
  readonly authority: string = '';
  readonly path: string = '';
  readonly query: string = '';
  readonly fragment: string = '';

  private constructor(public readonly fsPath: string) {
    this.path = fsPath;
  }

  with(change: { scheme?: string; authority?: string; path?: string; query?: string; fragment?: string }): Uri {
    return new Uri(change.path || this.fsPath);
  }

  toString(_skipEncoding?: boolean): string {
    return `${this.scheme}://${this.fsPath}`;
  }

  static file(path: string) {
    return new Uri(path);
  }

  static parse(value: string, _strict?: boolean) {
    return new Uri(value.substring(7));
  }

  static joinPath(base: Uri, ...pathSegments: string[]) {
    return new Uri(path.join(base.fsPath, ...pathSegments));
  }
};
