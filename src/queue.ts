
export class Queue<T> {
    private storage: T[] = [];
 
    enqueue(item: T): void {
      this.storage.push(item);
    }
    dequeue(): T | undefined {
      return this.storage.shift();
    }
    size(): number {
      return this.storage.length;
    }
  }
