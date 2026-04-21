import { splitTextIntoChunks } from '@/common/utils/text-splitter';
import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import { EmbeddingService } from '../embedding/embedding.service';

const pdfParse = require('pdf-parse'); // ✅ clean now

@Injectable()
export class PdfService {
  constructor(private embeddingService: EmbeddingService) { }

  async processPdf(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(dataBuffer);
      const chunks = splitTextIntoChunks(pdfData.text);
      const results: { text: string; vectorLength: number }[] = [];

      for (const chunk of chunks) {
        const embedding = await this.embeddingService.generateEmbedding(chunk);

        results.push({
          text: chunk,
          vectorLength: embedding.length,
        });
      }

      return {
        fileName: file.filename,
        totalChunks: chunks.length,
        sampleEmbeddingSize: results[0].vectorLength,
      };
    } catch (error) {
      console.error('PDF ERROR:', error);
      throw new BadRequestException('Error processing PDF');
    }
  }
}