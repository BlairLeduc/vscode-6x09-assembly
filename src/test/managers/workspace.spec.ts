import * as vscode from 'vscode';
import { WorkspaceManager } from '../../managers';
import { Logger } from '../../logger';

import { TextDocument } from '../scaffold';

describe('WorkspaceManager', () => {
  const logOutputChannel = vscode.window.createOutputChannel('6x09 Assembly', { log: true });
  beforeEach(() => {
    logOutputChannel.clear();
    Logger.init(logOutputChannel);
  });

  it('should be created', () => {
    vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.file('valid') });
    const manager = new WorkspaceManager('valid');
    manager.init();
    expect(manager).toBeTruthy();
  });

  it('should dispose', async () => {
    const manager = new WorkspaceManager('valid');
    await manager.init();
    manager.dispose();
    expect(manager.isDisposed).toBeTruthy();
  });

  it("should init without a workspace", async () => {
    const manager = new WorkspaceManager('valid');
    await manager.init();
    expect(manager.isDisposed).toBeFalsy();
  });

  it('should handle workspace folder changes', async () => {
    const manager = new WorkspaceManager('valid');
    await manager.init();
    vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.file('valid') });
    expect(manager.isDisposed).toBeFalsy();
  });

  it('should handle workspace folder changes', async () => {
    const manager = new WorkspaceManager('valid');
    await manager.init();
    vscode.workspace.updateWorkspaceFolders(0, 1, { uri: vscode.Uri.file('valid') });
    expect(manager.isDisposed).toBeFalsy();
  });

  it('should handle open document', async () => {
    const manager = new WorkspaceManager('valid');
    await manager.init();
    const uri = vscode.Uri.file('valid/struct.asm');
    const document = await vscode.workspace.openTextDocument(uri);
    const result = manager.getAssemblyDocument(document);
    expect(result).toBeTruthy();
    expect(result?.uri.toString()).toEqual(uri.toString());
  });

  it('should handle document change', async () => {
    const manager = new WorkspaceManager('valid');
    await manager.init();
    const uri = vscode.Uri.file('valid/struct.asm');
    const document = await vscode.workspace.openTextDocument(uri) as unknown as TextDocument;
    document.putText(['hello']);
    const result = manager.getAssemblyDocument(document as unknown as vscode.TextDocument);
    expect(result).toBeTruthy();
    expect(result?.uri.toString()).toEqual(uri.toString());
  });

  it('should handle document close', async () => {
    const manager = new WorkspaceManager('valid');
    await manager.init();
    const uri = vscode.Uri.file('valid/struct.asm');
    const document = await vscode.workspace.openTextDocument(uri) as unknown as TextDocument;
    document.close();
    const result = manager.getAssemblyDocument(document as unknown as vscode.TextDocument);
    expect(result).toBeFalsy();
  });

  it('should handle document delete', async () => {
    const manager = new WorkspaceManager('valid');
    await manager.init();
    const uri = vscode.Uri.file('valid/struct.asm');
    const document = await vscode.workspace.openTextDocument(uri) as unknown as TextDocument;
    document.delete();
    const result = manager.getAssemblyDocument(document as unknown as vscode.TextDocument);
    expect(result).toBeFalsy();
  });

  it('should handle document rename', async () => {
    const manager = new WorkspaceManager('valid');
    await manager.init();
    const oldUri = vscode.Uri.file('valid/struct.asm');
    const document = await vscode.workspace.openTextDocument(oldUri) as unknown as TextDocument;
    const newUri = vscode.Uri.file('valid/struct2.asm');
    await document.rename(newUri);
    const resultOld = manager.hasDocument(oldUri);
    expect(resultOld).toBeFalsy();
    const resultNew = manager.hasDocument(newUri);
    expect(resultNew).toBeTruthy();
  });

  it("should get symbol manager", async () => {
    const manager = new WorkspaceManager('valid');
    await manager.init();
    const uri = vscode.Uri.file('valid/struct.asm');
    const docuemnt = await vscode.workspace.openTextDocument(uri);
    const symbolManager = manager.getSymbolManager(docuemnt);
    expect(symbolManager).toBeTruthy();
  });

  it("should get symbol manager from unseen document", async () => {
    const manager = new WorkspaceManager('valid');
    await manager.init();
    const document = TextDocument.create('valid/struct.asm');
    const symbolManager = manager.getSymbolManager(document as unknown as vscode.TextDocument);
    expect(symbolManager).toBeTruthy();
  });

  it("should get all symbol managers", async () => {
    const manager = new WorkspaceManager('valid');
    await manager.init();
    const uri = vscode.Uri.file('valid/struct.asm');
    await vscode.workspace.openTextDocument(uri);
    const symbolManagers = manager.getAllSymbolManagers();
    expect(symbolManagers).toBeTruthy();
  });

  it('should not add a document that is not the correct language', async () => {
    const manager = new WorkspaceManager('valid');
    await manager.init();
    const document = TextDocument.create('valid/hello.txt');
    
    await manager.setDocument(document as unknown as vscode.TextDocument);

    expect(manager.getAssemblyDocument(document as unknown as vscode.TextDocument)).toBeFalsy();
  });

  it('should remove a document', async () => {
    const manager = new WorkspaceManager('valid');
    await manager.init();
    const uri = vscode.Uri.file('valid/struct.asm');
    const document = await vscode.workspace.openTextDocument(uri);
    manager.deleteDocument(document);
    expect(manager.hasDocument(uri)).toBeFalsy();
  });

  it ('should not remove a document that is not the correct language', async () => {
    const manager = new WorkspaceManager('valid');
    await manager.init();
    const document = TextDocument.create('valid/hello.txt');
    
    await manager.setDocument(document as unknown as vscode.TextDocument);
    manager.deleteDocument(document as unknown as vscode.TextDocument);

    expect(manager.getAssemblyDocument(document as unknown as vscode.TextDocument)).toBeFalsy();
  });
});
