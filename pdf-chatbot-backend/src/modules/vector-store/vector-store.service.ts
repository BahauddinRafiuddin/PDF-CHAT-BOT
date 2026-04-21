import { Injectable } from '@nestjs/common';

export type VectorItem = {
  text: string;
  embedding: number[];
};

@Injectable()
export class VectorStoreService {
  private store: VectorItem[] = [];

  add(item: VectorItem) {
    this.store.push(item);
  }

  getAll(): VectorItem[] {
    return this.store;
  }

  clear() {
    this.store = [];
  }
}