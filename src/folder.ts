import { TextDocument, TextDocumentContentChangeEvent, Uri } from 'vscode';
import { Collection } from './collection';
import { AssemblyDocument } from './parser';

export class AssemblyFolder {
  public documents: Collection<AssemblyDocument> = new Collection<AssemblyDocument>();

  constructor(public uri?: Uri) {
  }

  public containsAssemblyDocument(document: TextDocument): boolean {
    return this.documents.containsKey(document.uri);
  }
  public addAssemblyDocument(document: TextDocument): AssemblyDocument {
    return this.documents.add(document.uri, new AssemblyDocument(document));
  }

  public getAssemblyDocument(document: TextDocument): AssemblyDocument {
    return this.documents.get(document.uri);
  }

  public updateAssemblyDocument(document: TextDocument, _: readonly TextDocumentContentChangeEvent[]): AssemblyDocument {
    // Optimisation potential: look at what changed in document instead of re-parseing the whole thing
    return this.documents.add(document.uri, new AssemblyDocument(document));
  }

  public removeAssemblyDocument(document: TextDocument): void {
    this.documents.remove(document.uri);
  }
}
