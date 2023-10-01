import * as vscode from 'vscode';
import { pathJoin, basePath, appendPath } from '../../common/path';

describe('path', () => {
  it('should join paths', () => {
    expect(pathJoin('/foo', 'bar', 'baz')).toBe('/foo/bar/baz');
  });

  it('should join paths with trailing slashes', () => {
    expect(pathJoin('/foo/', 'bar/', 'baz/')).toBe('/foo/bar/baz');
  });

  it('should return the base path', () => {
    expect(basePath(vscode.Uri.file('/foo/bar/baz'))).toBe('/foo/bar');
  });

  it('should return the base path for a file', () => {
    expect(basePath(vscode.Uri.file('/foo/bar/baz.txt'))).toBe('/foo/bar');
  });

  it('should return the base path with no path', () => {
    expect(basePath(vscode.Uri.file('/foo'))).toBe('');
  });

  it('should append paths', () => {
    expect(appendPath(vscode.Uri.file('/foo/bar/baz'), 'qux', 'quux').path)
      .toBe('/foo/bar/qux/quux');
  });
});