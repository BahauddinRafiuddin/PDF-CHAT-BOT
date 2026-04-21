import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChromaClient } from 'chromadb';

@Injectable()
export class ChromaService implements OnModuleInit {
  private client!: ChromaClient;
  private collection!: any;

  async onModuleInit() {
    this.client = new ChromaClient({
      path: "http://localhost:8000",
    });

    this.collection = await this.client.getOrCreateCollection({
      name: 'pdf-docs',
      embeddingFunction: null,
    });

    console.log('✅ Chroma DB ready');
  }

  //  Store embeddings
  async addDocuments(docs: {
    ids: string[];
    embeddings: number[][];
    documents: string[];
  }) {
    await this.collection.add(docs);
  }

  //  Query similar
  async query(queryEmbedding: number[]) {
    const result = await this.collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: 3,
    });

    return result;
  }
}