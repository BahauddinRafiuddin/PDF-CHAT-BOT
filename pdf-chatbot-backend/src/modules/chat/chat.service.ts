import { Injectable } from '@nestjs/common';
import { EmbeddingService } from '../embedding/embedding.service';
import { VectorStoreService } from '../vector-store/vector-store.service';
import { cosineSimilarity } from '@/common/utils/similarity.util';
import { LLMService } from '../llm/llm.service';
import { ChromaService } from '../vector-db/chroma.service';

@Injectable()
export class ChatService {
  constructor(
    private embeddingService: EmbeddingService,
    private llmService: LLMService,
    private chromaService: ChromaService
  ) { }

  async ask(question: string,docId: string) {
    // Step 1: Convert question → embedding
    const queryEmbedding = await this.embeddingService.generateEmbedding(question);

    // Step 2: Query Chroma
    const result = await this.chromaService.query(queryEmbedding,{
      docId,
    });

    const contextDocs = result?.documents?.[0] || [];

    if (!contextDocs.length) {
      return {
        answer: "I don't know",
      };
    }

    const context = contextDocs.join('\n\n');

    // Step 3: Prompt
    const prompt = `
    You are a strict AI assistant.

    You must answer ONLY using the provided context.

    Rules:
    - If part of the question is NOT in the context, ignore that part.
    - Do NOT generate any extra knowledge.
    - Do NOT write code unless it is present in the context.
    - If the answer is not found, say: "I don't know".

    Context:
    ${context}

    Question:
    ${question}

    Answer:
    `;

    // Step 4: Generate answer
    const answer = await this.llmService.generateResponse(prompt);

    return {
      answer,
      sources: contextDocs,
    };
  }
}
