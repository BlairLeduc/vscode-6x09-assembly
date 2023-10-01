import * as vscode from 'vscode';
import { AssemblyFileReference } from '../../parsers';

describe('AssemblyFileReference', () => {
  it('should create', () => {
    const uri = vscode.Uri.file('foo');
    const range = new vscode.Range(1, 2, 3, 4);
    const reference = new AssemblyFileReference(uri, range);
    expect(reference.uri).toBe(uri);
    expect(reference.range).toBe(range);
  });
});