import { Uri } from 'vscode';

export class Collection<T>  {
  private items: { [id: string]: T } = {};

  public containsKey(key: Uri): boolean {
    return this.items.hasOwnProperty(key.toString());
  }

  public add(key: Uri, value: T): T {
    this.items[key.toString()] = value;
    return value;
  }

  public remove(key: Uri): void {
    delete this.items[key.toString()];
  }

  public get(key: Uri): T {
    return this.items[key.toString()];
  }

  public keys(): Uri[] {
    const keys: Uri[] = [];

    for (const key in this.items) {
      if (this.items.hasOwnProperty(key)) {
        keys.push(Uri.parse(key));
      }
    }

    return keys;
  }

  public values(): T[] {
    const values: T[] = [];

    for (const key in this.items) {
      if (this.items.hasOwnProperty(key)) {
        values.push(this.items[key]);
      }
    }

    return values;
  }
}
