import { Injectable, OnModuleInit } from '@nestjs/common';
import { pipeline } from '@xenova/transformers';

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private extractor: any;

  async onModuleInit() {
    // Load model once when app starts
    this.extractor = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );

    console.log('✅ Embedding model loaded');
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const output = await this.extractor(text);

    // Convert tensor to array properly
    const data = output.tolist(); // ✅ important

    // data shape: [1, tokens, dimensions]
    const tokens = data[0]; // remove batch dimension

    const dim = tokens[0].length;
    const avg = new Array(dim).fill(0);

    for (const token of tokens) {
      for (let i = 0; i < dim; i++) {
        avg[i] += token[i];
      }
    }

    return avg.map(v => v / tokens.length);
  }
}