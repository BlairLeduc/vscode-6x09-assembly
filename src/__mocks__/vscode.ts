/* eslint-disable @typescript-eslint/naming-convention */
// vscode.js

import { LogOutputChannel } from "vscode";
import * as path from 'path';
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

const fs = {
  readFile: (uri: Uri) => {
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
          '  include "6809.inc"\n' +
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
    return Promise.resolve(Buffer.from(''));
  },
};

const workspace = {
  fs,
  getConfiguration: jest.fn(),
  workspaceFolders: [],
  onDidSaveTextDocument: jest.fn()
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
}

class Range {
  constructor(public readonly start: Position, public readonly end: Position) {
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

const vscode = {
  CancellationTokenSource,
  commands,
  CompletionItemKind,
  debug,
  Diagnostic,
  DiagnosticSeverity,
  languages,
  OverviewRulerLane,
  Position,
  Range,
  StatusBarAlignment,
  SymbolKind,
  Uri,
  window,
  workspace,
};

module.exports = vscode;