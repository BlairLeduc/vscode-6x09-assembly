import * as vscode from 'vscode';

export function pathJoin(...paths: string[]): string {
  return paths.map(p => p.replace(/([\/\s]+$)/, '')).join('/');
}

export function basePath(uri: vscode.Uri): string {
  return uri.path.split('/').slice(0, -1).join('/') || '';
}

export function appendPath(uri: vscode.Uri, ...paths: string[]): vscode.Uri {
  return uri.with({ path: pathJoin(basePath(uri), ...paths) });
}
