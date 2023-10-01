/* eslint-disable @typescript-eslint/naming-convention */

import { LogOutputChannel } from "vscode";
import { Disposable, Event, EventEmitter, TextContent, TextDocument, Uri } from "../scaffold";

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

class FileSystem {
  readFile(uri: Uri): Promise<Buffer> {
    const fileName = uri.fsPath;
    if (fileName.startsWith('valid')) {
      return Promise.resolve(Buffer.from(TextContent.getFile(fileName)));
    }
    if (fileName.startsWith('invalid')) {
      return Promise.resolve(Buffer.from(TextContent.getFile(fileName)));
    }
    if (fileName.startsWith('empty')) {
      return Promise.resolve(Buffer.from(''));
    }
    if (fileName.startsWith("throw")) {
      return Promise.reject(new Error('test'));
    }
    return Promise.reject(new Error(`Unknown file: ${fileName}`));
  }
}

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

class WorkspaceFolder {
  readonly uri: Uri;
  readonly name: string;
  readonly index: number;

  constructor(uri: Uri, name: string, index: number) {
    this.uri = uri;
    this.name = name;
    this.index = index;
  }
}

class WorkspaceFoldersChangeEvent {
  readonly added: readonly WorkspaceFolder[];
  readonly removed: readonly WorkspaceFolder[];
}

class TextDocumentChangeEvent {
  readonly document: TextDocument;
  readonly contentChanges: readonly string[];
  readonly reason: string | undefined;
}

class FileCreateEvent {
  readonly files: readonly Uri[];
}

class FileDeleteEvent {
  readonly files: readonly Uri[];
}

class FileRenameEvent {
  readonly files: ReadonlyArray<{ readonly oldUri: Uri; readonly newUri: Uri }>;
}

class Workspace {
  private onDidChangeWorkspaceFoldersEmitter = new EventEmitter<WorkspaceFoldersChangeEvent>();
  private onDidOpenTextDocumentEmitter = new EventEmitter<TextDocument>();
  private onDidChangeTextDocumentEmitter = new EventEmitter<TextDocumentChangeEvent>();
  private onDidCloseTextDocumentEmitter = new EventEmitter<TextDocument>();
  private onDidCreateFilesEmitter = new EventEmitter<FileCreateEvent>();
  private onDidDeleteFilesEmitter = new EventEmitter<FileDeleteEvent>();
  private onDidRenameFilesEmitter = new EventEmitter<FileRenameEvent>();

  fs: FileSystem = new FileSystem();
  onDidChangeWorkspaceFolders: Event<WorkspaceFoldersChangeEvent> = this.onDidChangeWorkspaceFoldersEmitter.event;
  onDidOpenTextDocument: Event<TextDocument> = this.onDidOpenTextDocumentEmitter.event;
  onDidChangeTextDocument: Event<TextDocumentChangeEvent> = this.onDidChangeTextDocumentEmitter.event;
  onDidCloseTextDocument: Event<TextDocument> = this.onDidCloseTextDocumentEmitter.event;
  onDidCreateFiles: Event<FileCreateEvent> = this.onDidCreateFilesEmitter.event;
  onDidDeleteFiles: Event<FileDeleteEvent> = this.onDidDeleteFilesEmitter.event;
  onDidRenameFiles: Event<FileRenameEvent> = this.onDidRenameFilesEmitter.event;
  textDocuments: TextDocument[] = [];
  workspaceFolders: WorkspaceFolder[] | undefined = undefined;

  findFiles(_globPattern: string, _ignore?: string, _maxResults?: number, _token?: CancellationToken): Promise<Uri[]> {
    return Promise.resolve([Uri.file('valid/hello.asm'), Uri.file('valid/struct.asm')]);
  }

  getConfiguration(_language: string) {
    return testConfig;
  }

  getWorkspaceFolder(uri: Uri) {
    if (uri.fsPath.startsWith('valid')) {
      if (uri.fsPath.includes('asm')) {
        return new WorkspaceFolder(uri, 'asm', 0);
      }
      if (uri.fsPath.includes('refs')) {
        return new WorkspaceFolder(uri, 'refs', 1);
      }
    }
    return undefined;
  }

  updateWorkspaceFolders(_start: number, deleteCount: number, ...workspaceFoldersToAdd: WorkspaceFolder[]): void {
    if (deleteCount > 0) {
      this.workspaceFolders = undefined;
      this.onDidChangeWorkspaceFoldersEmitter.fire({ added: [], removed: workspaceFoldersToAdd });
      return;
    }
    this.workspaceFolders = workspaceFoldersToAdd;
    this.onDidChangeWorkspaceFoldersEmitter.fire({ added: workspaceFoldersToAdd, removed: [] });
  }

  async openTextDocument(uri: Uri): Promise<TextDocument> {
    const textDocument = TextDocument.create(uri.fsPath);
    this.textDocuments.push(textDocument);
    textDocument.onDidChange(d => {
      this.onDidChangeTextDocumentEmitter.fire({document: d, contentChanges: ['test'], reason: undefined});
    });
    textDocument.onDidClose(d => {
      this.onDidCloseTextDocumentEmitter.fire(d);
    });
    textDocument.onDidDelete(uri => {
      this.onDidDeleteFilesEmitter.fire({ files: [uri] });
    });
    textDocument.onDidRename(async e => {
      const textDocument = TextDocument.create(uri.fsPath);
      this.textDocuments.push(textDocument);
      await this.onDidRenameFilesEmitter.fire({ files: [{ oldUri: e.oldUri, newUri: e.newUri }] });
    });

    await this.onDidOpenTextDocumentEmitter.fire(textDocument);
    return textDocument;
  }
  
};

const workspace = new Workspace();

const OverviewRulerLane = {
  Left: null
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

const vscode = {
  CancellationTokenSource,
  commands,
  CompletionItemKind,
  debug,
  Diagnostic,
  DiagnosticSeverity,
  Disposable,
  Event,
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
  WorkspaceFolder,
  WorkspaceFoldersChangeEvent,
};

module.exports = vscode;