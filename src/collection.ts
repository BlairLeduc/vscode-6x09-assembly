import { Uri } from "vscode";

export class Collection<T>  {
  private items: { [id: string]: T } = {};

  public containsKey = (key: Uri | string): boolean => this.items.hasOwnProperty(key.toString());
  public add = (key: Uri | string, value: T): T => this.items[key.toString()] = value;
  public remove = (key: Uri | string): boolean => delete this.items[key.toString()];
  public get = (key: Uri | string): T => this.items[key.toString()];
  public keys = (): string[] => Object.keys(this.items);
  public values = (): T[] => Object.keys(this.items).map(k => this.items[k]);
  public clear = (): void => { this.items = {}; };
}
