import * as vscode from 'vscode';

export function isTextDocument(
  document: vscode.TextDocument | vscode.Uri): document is vscode.TextDocument {

  return (document as vscode.TextDocument).lineCount !== undefined;
}

export function isUri(document: vscode.TextDocument | vscode.Uri): document is vscode.Uri {
  return (document as vscode.Uri).authority !== undefined;
}

