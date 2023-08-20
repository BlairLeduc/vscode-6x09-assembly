import * as vscode from 'vscode';
import { WorkspaceManager } from '../../managers';
import { Logger } from '../../logger';

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
    await vscode.workspace.openTextDocument(uri);
    expect(manager.getDocument(uri)).toBeTruthy();
  });

  it("should get symbol manager", async () => {
    const manager = new WorkspaceManager('valid');
    await manager.init();
    const uri = vscode.Uri.file('valid/struct.asm');
    await vscode.workspace.openTextDocument(uri);
    const symbolManager = manager.getSymbolManager(uri);
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
    const uri = vscode.Uri.file('valid/hello.txt');
    await vscode.workspace.openTextDocument(uri);
    expect(manager.getDocument(uri)).toBeFalsy();
  });
});
