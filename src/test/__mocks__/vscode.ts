/* eslint-disable @typescript-eslint/naming-convention */
// vscode.js

import { LogOutputChannel } from "vscode";
import * as path from 'path';
import { ASM6X09_LANGUAGE } from "../../constants";
/**
 * Completion item kinds.
 */
enum CompletionItemKind {
  Text = 0,
  Method = 1,
  Function = 2,
  Constructor = 3,
  Field = 4,
  Variable = 5,
  Class = 6,
  Interface = 7,
  Module = 8,
  Property = 9,
  Unit = 10,
  Value = 11,
  Enum = 12,
  Keyword = 13,
  Snippet = 14,
  Color = 15,
  Reference = 17,
  File = 16,
  Folder = 18,
  EnumMember = 19,
  Constant = 20,
  Struct = 21,
  Event = 22,
  Operator = 23,
  TypeParameter = 24,
  User = 25,
  Issue = 26,
}

/**
 * A symbol kind.
 */
enum SymbolKind {
  File = 0,
  Module = 1,
  Namespace = 2,
  Package = 3,
  Class = 4,
  Method = 5,
  Property = 6,
  Field = 7,
  Constructor = 8,
  Enum = 9,
  Interface = 10,
  Function = 11,
  Variable = 12,
  Constant = 13,
  String = 14,
  Number = 15,
  Boolean = 16,
  Array = 17,
  Object = 18,
  Key = 19,
  Null = 20,
  EnumMember = 21,
  Struct = 22,
  Event = 23,
  Operator = 24,
  TypeParameter = 25
}

const languages = {
  createDiagnosticCollection: jest.fn()
};

const StatusBarAlignment = {};

const logOutputChannel: LogOutputChannel = {
  append: jest.fn(),
  appendLine: jest.fn(),
  replace: jest.fn(),
  clear: jest.fn(),
  show: jest.fn(),
  hide: jest.fn(),
  dispose: jest.fn(),
  name: '6x09 Assembly',
  trace: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  logLevel: 4,
  onDidChangeLogLevel: jest.fn(),

};

const window = {
  showErrorMessage: jest.fn(),
  showWarningMessage: jest.fn(),
  createTextEditorDecorationType: jest.fn(),
  createOutputChannel: () => logOutputChannel,
};

class fs {
  static id: number = 0;
  static readFile(uri: Uri): Promise<Buffer> {
    const fileName = uri.fsPath;
    if (fileName.startsWith('valid')) {
      if (fileName.includes('opcodes.tsv')) {
        return Promise.resolve(Buffer.from(
          'Name\tProcessor\tCondition\tCodes\tSummary\tNotation\tDocumentation\n' +
          'ABX\t6809\tH=• N=• Z=• V=• C=•\tAdd B into X (Unsigned)\tX\' ← X + B\tAdd the unsigned value in B into X.\n' +
          'ADCA\t6809\tH=↕ N=↕ Z=↕ V=↕ C=↕\tAdd Memory Byte with Carry into A\tA\' ← A + M + C\tAdd A, the C (carry) bit and the memory byte into A.\n'));
      }
      if (fileName.includes('pseudo-ops.tsv')) {
        return Promise.resolve(Buffer.from(
          'Name\tSummary\n' +
          'EQU\tSet a Symbol to a Value\n' +
          'FCB\tDefine Byte(s)\n'));
      }
      if (fileName.includes('hello.asm')) {
        return Promise.resolve(Buffer.from(
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
          '  fcb 0\n'));
      }
      if (fileName.includes('refs.asm')) {
        return Promise.resolve(Buffer.from(
          ` include "6809-${this.id++}.inc"\n` +
          'start\n' +
          ' ldx #$DEAD\n' +
          '\n' +
          'done\n' +
          ' rts\n'));
      }
      if (fileName.includes('struct.asm')) {
        return Promise.resolve(Buffer.from(
          'things struct\n' +
          'one rmb 1\n' +
          'two rmb 1\n' +
          ' ends\n' +
          'test things\n' +
          ' lda #test.one\n'));
      }
    }
    if (fileName.startsWith('invalid')) {
      if (fileName.includes('opcodes.tsv')) {
        return Promise.resolve(Buffer.from(
          'Name\tProcessor\tCondition\tCodes\tSummary\tNotation\tDocumentation\n' +
          'WNG' // missing columns
        ));
      }
      if (fileName.includes('pseudo-ops.tsv')) {
        return Promise.resolve(Buffer.from(
          'Name\tSummary\tDocumentation\n' +
          'BAD' // missing columns
        ));
      }
    }
    if (fileName.startsWith('empty')) {
      return Promise.resolve(Buffer.from(''));
    }
    if (fileName.startsWith("throw")) {
      return Promise.reject(new Error('test'));
    }
    return Promise.reject(new Error(`Unknown file: ${fileName}`));
  }
};

const testConfig = {
  enableCodeLens: false,
  opcode: {
    casing: 'uppercase',
    help: 'none',
  },
  lwasm: {
    path: 'lwasm',
    arguments: '--test',
  },
  xroar: {
    path: 'xroar',
    arguments: '-machine test',
  },
  debugPort: 6809,
};


const workspace = {
  fs,
  getConfiguration: (_language: string) => {
    return testConfig;
  },
  workspaceFolders: [],
  onDidSaveTextDocument: jest.fn(),
  openTextDocument: async (uri: Uri) => {
    return await TextDocument.create(uri.fsPath);
  }
};

const OverviewRulerLane = {
  Left: null
};

class Uri {
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
  toJSON(): any {
    return JSON.stringify(this);
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

class Position {
  constructor(public readonly line: number, public readonly character: number) {
  }

  isBefore(other: Position): boolean {
    return this.line < other.line || (this.line === other.line && this.character < other.character);
  }

  isBeforeOrEqual(other: Position): boolean {
    return this.line < other.line || (this.line === other.line && this.character <= other.character);
  }

  isAfter(other: Position): boolean {
    return this.line > other.line || (this.line === other.line && this.character > other.character);
  }

  isAfterOrEqual(other: Position): boolean {
    return this.line > other.line || (this.line === other.line && this.character >= other.character);
  }

  isEqual(other: Position): boolean {
    return this.line === other.line && this.character === other.character;
  }
}

class Range {
  constructor(public readonly start: Position, public readonly end: Position) {
  }

  get isEmpty(): boolean {
    return this.start.line === this.end.line && this.start.character === this.end.character;
  }

  get isSingleLine(): boolean {
    return this.start.line === this.end.line;
  }

  contains(positionOrRange: Position | Range): boolean {
    if (positionOrRange instanceof Position) {
      return this.start.isBeforeOrEqual(positionOrRange) && this.end.isAfterOrEqual(positionOrRange);
    }
    return this.contains(positionOrRange.start) && this.contains(positionOrRange.end);
  }

  isEqual(other: Range): boolean {
    return this.start.isEqual(other.start) && this.end.isEqual(other.end);
  }

  intersection(range: Range): Range | undefined {
    const start = range.start.isBefore(this.start) ? this.start : range.start;
    const end = this.end.isBefore(range.end) ? this.end : range.end;

    if (end.isBefore(start)) {
      return undefined;
    }
    return new Range(start, end);
  }

  union(other: Range): Range {
    const start = other.start.isBefore(this.start) ? other.start : this.start;
    const end = this.end.isBefore(other.end) ? other.end : this.end;
    return new Range(start, end);
  }

  with(start?: Position, end?: Position): Range {
    if (start === undefined) {
      start = this.start;
    }
    if (end === undefined) {
      end = this.end;
    }
    if (start === this.start && end === this.end) {
      return this;
    }
    return new Range(start, end);
  }
}

const Diagnostic = jest.fn();
const DiagnosticSeverity = { Error: 0, Warning: 1, Information: 2, Hint: 3 };

const debug = {
  onDidTerminateDebugSession: jest.fn(),
  startDebugging: jest.fn()
};

const commands = {
  executeCommand: jest.fn()
};

interface CancellationToken {
  isCancellationRequested: boolean;
}

class CancellationTokenSource {
  token: CancellationToken = {
    isCancellationRequested: false,
  };
  cancel() {
    this.token.isCancellationRequested = true;
  }
}

class TextDocument {
  private content: string[] = [];

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

  static async create(filename: string) {
    const uri = Uri.file(filename);
    const text = await fs.readFile(uri);
    const lines = text.toString().split(/\r?\n/);

    const document = new TextDocument(
      uri,
      filename,
      ASM6X09_LANGUAGE,
      1,
      false,
      false,
      false,
      '\n',
      lines.length);

    document.putText(lines);

    return document;
  }

  private putText(lines: string[]) {
    this.content = lines;
  }

  getText(_range?: Range): string {
    return this.content.join('\n');
  }
}

export interface Disposable {
  dispose(): any;
}

export interface Event<T> {

  /**
   * A function that represents an event to which you subscribe by calling it with
   * a listener function as argument.
   *
   * @param listener The listener function will be called when the event happens.
   * @param thisArgs The `this`-argument which will be used when calling the event listener.
   * @param disposables An array to which a {@link Disposable} will be added.
   * @return A disposable which unsubscribes the event listener.
   */
  (listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]): Disposable;
}

class EventEmitter<T> implements Disposable {
  private handler: (e: T) => any = () => { };
  event: Event<T> = (listener: (e: T) => any, _thisArgs?: any, _disposables?: Disposable[]) => {
    this.handler = listener;
    return this;
  };
  fire(data: T) {
    this.handler(data);
  }
  dispose() {
    this.handler(undefined as T);
  }
}

const vscode = {
  CancellationTokenSource,
  commands,
  CompletionItemKind,
  debug,
  Diagnostic,
  DiagnosticSeverity,
  EventEmitter,
  languages,
  OverviewRulerLane,
  Position,
  Range,
  StatusBarAlignment,
  SymbolKind,
  TextDocument,
  Uri,
  window,
  workspace,
};

module.exports = vscode;