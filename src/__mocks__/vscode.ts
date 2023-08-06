/* eslint-disable @typescript-eslint/naming-convention */
// vscode.js

import { LogOutputChannel } from "vscode";

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
  readFile: (fileName: string) => {
    if (fileName.startsWith('valid')) {
      if (fileName.includes('opcodes.tsv')) {
        return Promise.resolve(Buffer.from(
          'Name\tProcessor\tCondition\tCodes\tSummary\tNotation\tDocumentation\n' +
          'ABX\t6809\tH=• N=• Z=• V=• C=•\tAdd B into X (Unsigned)\tX\' ← X + B\tAdd the unsigned value in B into X.\n' +
          'ADCA\t6809\tH=↕ N=↕ Z=↕ V=↕ C=↕\tAdd Memory Byte with Carry into A\tA\' ← A + M + C\tAdd A, the C (carry) bit and the memory byte into A.\n'));
      }
      if (fileName.includes('pseudo-ops.tsv')) {
        return Promise.resolve(Buffer.from(
          'Name\tSummary\tDocumentation\n' +
          'EQU\tSet a Symbol to a Value\tDefines a symbol to have a value.\n' +
          'FCB\tDefine Byte(s)\tDefines one or more bytes.\n'));
      }
    } else if (fileName.startsWith('invalid')) {
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

const Uri = {
  file: (f: string) => f,
  parse: jest.fn()
};
const Range = jest.fn();
const Diagnostic = jest.fn();
const DiagnosticSeverity = { Error: 0, Warning: 1, Information: 2, Hint: 3 };

const debug = {
  onDidTerminateDebugSession: jest.fn(),
  startDebugging: jest.fn()
};

const commands = {
  executeCommand: jest.fn()
};

const vscode = {
  CompletionItemKind,
  SymbolKind,
  languages,
  StatusBarAlignment,
  window,
  workspace,
  OverviewRulerLane,
  Uri,
  Range,
  Diagnostic,
  DiagnosticSeverity,
  debug,
  commands
};

module.exports = vscode;