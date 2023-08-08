import * as vscode from 'vscode';
import { SymbolManager } from '../../managers';
import { AssemblyDocument } from '../../parsers';
import { Logger } from '../../logger';
import { TokenType } from '../../constants';

describe('AssemblyDocument', () => {
  const logOutputChannel = vscode.window.createOutputChannel('6x09 Assembly', { log: true });
  beforeEach(() => {
    Logger.init(logOutputChannel);
  });

  describe('using url', () => {
    it('should create', async () => {
      const uri = vscode.Uri.file('valid/hello.asm');
      const symbolManager = new SymbolManager();
      const cancellationSource = new vscode.CancellationTokenSource();
      const document = await AssemblyDocument.create(uri, symbolManager, cancellationSource.token);

      expect(document).toBeTruthy();
      expect(logOutputChannel.debug).toBeCalledWith(`Parsed assembly document: ${uri.toString()}`);
    });

    it('should not create when cancelled', async () => {
      const uri = vscode.Uri.file('empty');
      const symbolManager = new SymbolManager();
      const cancellationSource = new vscode.CancellationTokenSource();
      cancellationSource.cancel();
      const document = await AssemblyDocument.create(uri, symbolManager, cancellationSource.token);

      expect(document).toBeFalsy();
    });

    it('should not create when ReadFile throws', async () => {
      const uri = vscode.Uri.file('throw');
      const symbolManager = new SymbolManager();
      const cancellationSource = new vscode.CancellationTokenSource();
      const document = await AssemblyDocument.create(uri, symbolManager, cancellationSource.token);

      expect(document).toBeFalsy();
      expect(logOutputChannel.error).toBeCalledWith(`Failed to read file: ${uri.toString()}`);
    });

    it('should process blocks in hello.asm', async () => {
      const uri = vscode.Uri.file('valid/hello.asm');
      const symbolManager = new SymbolManager();
      const cancellationSource = new vscode.CancellationTokenSource();
      const document = await AssemblyDocument.create(uri, symbolManager, cancellationSource.token);

      expect(document).toBeTruthy();
      expect(logOutputChannel.debug).toBeCalledWith(`Parsed assembly document: ${uri.toString()}`);

      expect(document?.lines.length).toBe(17);

      expect(document?.blocks.size).toBe(4);
      expect(document?.blocks.get(1)?.startLineNumber).toBe(0);
      expect(document?.blocks.get(1)?.endLineNumber).toBe(2);
      expect(document?.blocks.get(2)?.startLineNumber).toBe(4);
      expect(document?.blocks.get(2)?.endLineNumber).toBe(8);
      expect(document?.blocks.get(3)?.startLineNumber).toBe(10);
      expect(document?.blocks.get(3)?.endLineNumber).toBe(11);
      expect(document?.blocks.get(4)?.startLineNumber).toBe(13);
      expect(document?.blocks.get(4)?.endLineNumber).toBe(15);
    });

    it('should process labels in hello.asm', async () => {
      const uri = vscode.Uri.file('valid/hello.asm');
      const symbolManager = new SymbolManager();
      const cancellationSource = new vscode.CancellationTokenSource();
      const document = await AssemblyDocument.create(uri, symbolManager, cancellationSource.token);

      expect(document).toBeTruthy();
      expect(logOutputChannel.debug).toBeCalledWith(`Parsed assembly document: ${uri.toString()}`);

      expect(symbolManager.implementations.length).toBe(4);
      expect(symbolManager.implementations[0].text).toBe('start');
      expect(symbolManager.implementations[1].text).toBe('loop');
      expect(symbolManager.implementations[2].text).toBe('done');
      expect(symbolManager.implementations[3].text).toBe('message');
    });

    it('should process new file references in refs.asm', async () => {
      const uri = vscode.Uri.file('valid/refs.asm');
      const symbolManager = new SymbolManager();
      const cancellationSource = new vscode.CancellationTokenSource();
      const document = await AssemblyDocument.create(uri, symbolManager, cancellationSource.token);

      expect(document).toBeTruthy();
      expect(logOutputChannel.debug).toBeCalledWith(`Parsed assembly document: ${uri.toString()}`);

      expect(document?.referencedDocuments.length).toBe(1);
      expect(document?.referencedDocuments[0].uri.toString()).toBe('file://valid/6809-0.inc');
    });

    it('should process references in hello.asm', async () => {
      const uri = vscode.Uri.file('valid/hello.asm');
      const symbolManager = new SymbolManager();
      const cancellationSource = new vscode.CancellationTokenSource();
      const document = await AssemblyDocument.create(uri, symbolManager, cancellationSource.token);

      expect(document).toBeTruthy();
      expect(logOutputChannel.debug).toBeCalledWith(`Parsed assembly document: ${uri.toString()}`);

      expect(symbolManager.references.length).toBe(3);
      expect(symbolManager.references[0].text).toBe('message');
      expect(symbolManager.references[1].text).toBe('done');
      expect(symbolManager.references[2].text).toBe('loop');
    });

    it('should process struct implementations in struct.asm', async () => {
      const uri = vscode.Uri.file('valid/struct.asm');
      const symbolManager = new SymbolManager();
      const cancellationSource = new vscode.CancellationTokenSource();
      const document = await AssemblyDocument.create(uri, symbolManager, cancellationSource.token);

      expect(document).toBeTruthy();
      expect(logOutputChannel.debug).toBeCalledWith(`Parsed assembly document: ${uri.toString()}`);

      expect(symbolManager.implementations.length).toBe(4);

      expect(symbolManager.implementations[0].text).toBe('things');
      expect(symbolManager.implementations[0].type).toBe(TokenType.class);
      expect(symbolManager.implementations[0].kind).toBe(vscode.CompletionItemKind.Struct);
      expect(symbolManager.implementations[0].properties.length).toBe(2);
      expect(symbolManager.implementations[0].properties[0].text).toBe('one');
      expect(symbolManager.implementations[0].properties[1].text).toBe('two');
      
      expect(symbolManager.implementations[1].text).toBe('one');
      expect(symbolManager.implementations[1].parent?.text).toBe('things');
      expect(symbolManager.implementations[1].type).toBe(TokenType.class);
      expect(symbolManager.implementations[1].kind).toBe(vscode.CompletionItemKind.Property);
      
      expect(symbolManager.implementations[2].text).toBe('two');
      expect(symbolManager.implementations[2].parent?.text).toBe('things');
      expect(symbolManager.implementations[2].type).toBe(TokenType.class);
      expect(symbolManager.implementations[2].kind).toBe(vscode.CompletionItemKind.Property);
      
      expect(symbolManager.implementations[3].text).toBe('test');
      expect(symbolManager.implementations[3].type).toBe(TokenType.class);
      expect(symbolManager.implementations[3].kind).toBe(vscode.CompletionItemKind.Variable);
    });

    it('should process properties in struct.asm', async () => {
      const uri = vscode.Uri.file('valid/struct.asm');
      const symbolManager = new SymbolManager();
      const cancellationSource = new vscode.CancellationTokenSource();
      const document = await AssemblyDocument.create(uri, symbolManager, cancellationSource.token);

      expect(document).toBeTruthy();
      expect(logOutputChannel.debug).toBeCalledWith(`Parsed assembly document: ${uri.toString()}`);

      expect(symbolManager.references.length).toBe(3);

      expect(symbolManager.references[0].text).toBe('things');
      expect(symbolManager.references[0].lineNumber).toBe(4);
      expect(symbolManager.references[0].properties.length).toBe(0);
      
      expect(symbolManager.references[1].text).toBe('test');
      expect(symbolManager.references[1].lineNumber).toBe(5);
      expect(symbolManager.references[1].properties.length).toBe(1);
      expect(symbolManager.references[1].properties[0].text).toBe('one');
      
      expect(symbolManager.references[2].text).toBe('one');
      expect(symbolManager.references[2].parent?.text).toBe('test');
    });
  });

  describe('using text document', () => {
    it('should create', async () => {
      const uri = vscode.Uri.file('test.asm');
      const symbolManager = new SymbolManager();
      const cancellationSource = new vscode.CancellationTokenSource();
      const document = await AssemblyDocument.create({
        uri,
        languageId: '6x09-assembly',
        getText: () => 'foo',
      } as vscode.TextDocument, symbolManager, cancellationSource.token);

      expect(document).toBeTruthy();
    });
  });
});