import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChromaClient } from 'chromadb';

@Injectable()
export class ChromaService implements OnModuleInit {
  private client!: ChromaClient;
  private collection!: any;

  async onModuleInit() {
    this.client = new ChromaClient({
      path: "http://chroma:8000",
    });

    this.collection = await this.client.getOrCreateCollection({
      name: 'pdf-docs',
      embeddingFunction: null,
    });

    console.log('✅ Chroma DB ready');
  }

  //  Store embeddings
  async addDocuments(data: {
    ids: string[];
    embeddings: number[][];
    documents: string[];
    metadatas?: any[];
  }) {
    await this.collection.add({
      ids: data.ids,
      embeddings: data.embeddings,
      documents: data.documents,
      metadatas: data.metadatas,
    });
  }

  //  Query similar
  async query(embedding: number[], filter?: any) {
    return this.collection.query({
      queryEmbeddings: [embedding],
      nResults: 3,
      where: filter ? { docId: filter.docId } : undefined,
    });
  }

  // Delete Document
  async deleteByDocId(docId: string) {
  return this.collection.delete({
    where: {
      docId,
    },
  });
}
}