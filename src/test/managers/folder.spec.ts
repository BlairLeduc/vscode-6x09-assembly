import * as vscode from 'vscode';
import { Folder } from '../../managers/folder';
import { Logger } from '../../logger';

describe('Folder', () => {
  const logOutputChannel = vscode.window.createOutputChannel('6x09 Assembly', { log: true });
  beforeEach(() => {
    logOutputChannel.clear();
    Logger.init(logOutputChannel);
  });

  describe('In a workspace', () => {
    const workspaceFolder = {
      uri: vscode.Uri.file('foo'),
      name: 'foo',
      index: 0,
    } as vscode.WorkspaceFolder;

    it('should create for workspace', () => {
      const folder = new Folder(workspaceFolder);
      expect(folder.workspaceFolder).toBe(workspaceFolder);
      expect(folder.symbolManager).toBeTruthy();
      expect(logOutputChannel.info).toBeCalledWith(`Found workspace folder \"${workspaceFolder.name}\"`);
    });

    it('should dispose', () => {
      const folder = new Folder(workspaceFolder);
      folder.dispose();
    });

    it('should not contain a document', () => {
      const folder = new Folder(workspaceFolder);
      const uri = vscode.Uri.file('foo');
      const result = folder.has(uri);

      expect(result).toBeFalsy();
    });

    it('should add a document and contain it in a workspace', async () => {
      const folder = new Folder(workspaceFolder);

      const uri = vscode.Uri.file('valid/struct.asm');
      const document = await vscode.workspace.openTextDocument(uri);

      await folder.set(document);
      const exists = folder.has(document);

      expect(logOutputChannel.debug).toBeCalledWith(`Parsed assembly document: ${uri.toString()}`);
      expect(exists).toBeTruthy();
    });

    it('should check references when updating a document', async () => {
      const folder = new Folder(workspaceFolder);

      const uri = vscode.Uri.file('valid/refs.asm');
      const document = await vscode.workspace.openTextDocument(uri);
      const updatedDocument = await vscode.workspace.openTextDocument(uri);

      await folder.set(document);
      await folder.set(updatedDocument);

      expect(logOutputChannel.debug).toBeCalledWith(`Parsed assembly document: ${uri.toString()}`);
      expect(logOutputChannel.debug).toBeCalledWith(`Scanning referenced document file://valid/6809-1.inc`);
    });

    it('should check references when updating a document if refs not changed', async () => {
      const folder = new Folder(workspaceFolder);

      const uri = vscode.Uri.file('valid/refs.asm');
      const document = await vscode.workspace.openTextDocument(uri);

      await folder.set(document);
      await folder.set(document);

      expect(logOutputChannel.debug).toBeCalledWith(`Parsed assembly document: ${uri.toString()}`);
      expect(logOutputChannel.debug).toBeCalledWith(`Not updating references because they haven't changed`);
    });

    it('should get a document', async () => {
      const folder = new Folder(workspaceFolder);

      const uri = vscode.Uri.file('valid/struct.asm');
      const document = await vscode.workspace.openTextDocument(uri);

      await folder.set(document);
      const result = folder.get(uri);

      expect(result).toBeTruthy();
      expect(result?.uri.toString()).toBe(uri.toString());
    });

    it('should not get a document that doesn\'t exist', async () => {
      const folder = new Folder(workspaceFolder);

      const uri = vscode.Uri.file('valid/struct.asm');
      const result = folder.get(uri);

      expect(result).toBeFalsy();
    });

    it('should remove a document', async () => {
      const folder = new Folder(workspaceFolder);

      const uri = vscode.Uri.file('valid/struct.asm');
      const document = await vscode.workspace.openTextDocument(uri);

      await folder.set(document);
      await folder.delete(document);

      expect(folder.has(document)).toBeFalsy();
    });

    it('should remove a document by uri', async () => {
      const folder = new Folder(workspaceFolder);

      const uri = vscode.Uri.file('valid/struct.asm');
      const document = await vscode.workspace.openTextDocument(uri);

      await folder.set(document);
      await folder.delete(uri);

      expect(folder.has(document)).toBeFalsy();
    });
  });

  describe('Not in a workspace', () => {
    it('should create for no workspace', () => {
      const folder = new Folder();
      expect(folder.workspaceFolder).toBeFalsy();
      expect(folder.symbolManager).toBeTruthy();
      expect(logOutputChannel.info).not.toBeCalledWith();
    });

    it('should dispose', () => {
      const folder = new Folder();
      folder.dispose();
    });

    it('should add a document and contain it without a workspace', async () => {
      const folder = new Folder();

      const uri = vscode.Uri.file('valid/struct.asm');
      const document = await vscode.workspace.openTextDocument(uri);

      await folder.set(document);
      const exists = folder.has(document);

      expect(logOutputChannel.debug).toBeCalledWith(`Parsed assembly document: ${uri.toString()}`);
      expect(exists).toBeTruthy();
    });

    it('should check references when updating a document if refs changed', async () => {
      const folder = new Folder();

      const uri = vscode.Uri.file('valid/refs.asm');
      const document = await vscode.workspace.openTextDocument(uri);
      const updatedDocument = await vscode.workspace.openTextDocument(uri);

      await folder.set(document);
      await folder.set(updatedDocument);

      expect(logOutputChannel.debug).toBeCalledWith(`Parsed assembly document: ${uri.toString()}`);
      expect(logOutputChannel.debug).toBeCalledWith(`Scanning referenced document file://valid/6809-1.inc`);
    });

    it('should check references when updating a document if refs not changed', async () => {
      const folder = new Folder();

      const uri = vscode.Uri.file('valid/refs.asm');
      const document = await vscode.workspace.openTextDocument(uri);

      await folder.set(document);
      await folder.set(document);

      expect(logOutputChannel.debug).toBeCalledWith(`Parsed assembly document: ${uri.toString()}`);
      expect(logOutputChannel.debug).toBeCalledWith(`Not updating references because they haven't changed`);
    });

    it('should get a document', async () => {
      const folder = new Folder();

      const uri = vscode.Uri.file('valid/struct.asm');
      const document = await vscode.workspace.openTextDocument(uri);

      await folder.set(document);
      const result = folder.get(uri);

      expect(result).toBeTruthy();
      expect(result?.uri.toString()).toBe(uri.toString());
    });

    it('should not get a document that doesn\'t exist', async () => {
      const folder = new Folder();

      const uri = vscode.Uri.file('valid/struct.asm');
      const result = folder.get(uri);

      expect(result).toBeFalsy();
    });

    it('should remove a document', async () => {
      const folder = new Folder();

      const uri = vscode.Uri.file('valid/struct.asm');
      const document = await vscode.workspace.openTextDocument(uri);

      await folder.set(document);
      await folder.delete(document);

      expect(folder.has(document)).toBeFalsy();
    });

    it('should remove a document by uri', async () => {
      const folder = new Folder();

      const uri = vscode.Uri.file('valid/struct.asm');
      const document = await vscode.workspace.openTextDocument(uri);

      await folder.set(document);
      await folder.delete(uri);

      expect(folder.has(document)).toBeFalsy();
    });
  });
});