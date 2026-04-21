import { splitTextIntoChunks } from '@/common/utils/text-splitter';
import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import { EmbeddingService } from '../embedding/embedding.service';
import { VectorStoreService } from '../vector-store/vector-store.service';
import { v4 as uuidv4 } from 'uuid';
import { ChromaService } from '../vector-db/chroma.service';

const pdfParse = require('pdf-parse');

@Injectable()
export class PdfService {
  constructor(private embeddingService: EmbeddingService,
    private vectorStore: VectorStoreService,
    private chromaService: ChromaService
  ) { }

  async processPdf(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(dataBuffer);

      const chunks = splitTextIntoChunks(pdfData.text);

      const ids: string[] = [];
      const embeddings: number[][] = [];
      const documents: string[] = [];

      for (const chunk of chunks) {
        const embedding = await this.embeddingService.generateEmbedding(chunk);

        ids.push(uuidv4());
        embeddings.push(embedding);
        documents.push(chunk);
      }

      await this.chromaService.addDocuments({
        ids,
        embeddings,
        documents,
      });


      return {
        fileName: file.filename,
        totalChunks: chunks.length,
        message: 'Stored in vector DB 🚀',
      };

    } catch (error) {
      console.error('PDF ERROR:', error);
      throw new BadRequestException('Error processing PDF');
    }
  }
}