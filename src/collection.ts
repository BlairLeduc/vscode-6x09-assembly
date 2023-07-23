import * as vscode from 'vscode';

export class Collection<T>  {
  private items: { [id: string]: T } = {};

  public containsKey = (key: vscode.Uri | string): boolean => this.items.hasOwnProperty(key.toString());
  public add = (key: vscode.Uri | string, value: T): T => this.items[key.toString()] = value;
  public remove = (key: vscode.Uri | string): boolean => delete this.items[key.toString()];
  public get = (key: vscode.Uri | string): T => this.items[key.toString()];
  public keys = (): string[] => Object.keys(this.items);
  public values = (): T[] => Object.keys(this.items).map(k => this.items[k]);
  public clear = (): void => { this.items = {}; };
}
