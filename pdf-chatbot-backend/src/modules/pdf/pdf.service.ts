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
      const docId = uuidv4();

      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(dataBuffer);

      const chunks = splitTextIntoChunks(pdfData.text);

      const ids: string[] = [];
      const embeddings: number[][] = [];
      const documents: string[] = [];
      const metadatas: any[] = [];

      for (const chunk of chunks) {
        const embedding = await this.embeddingService.generateEmbedding(chunk);

        ids.push(uuidv4());
        embeddings.push(embedding);
        documents.push(chunk);

        metadatas.push({
          docId,
          fileName: file.originalname,
          storedFileName: file.filename,
        });
      }

      await this.chromaService.addDocuments({
        ids,
        embeddings,
        documents,
        metadatas,
      });

      return {
        docId,
        fileName: file.originalname,    
        storedFileName: file.filename,  
        totalChunks: chunks.length,
        message: 'Stored in vector DB 🚀',
      };

    } catch (error) {
      console.error('PDF ERROR:', error);
      throw new BadRequestException('Error processing PDF');
    }
  }

  async deleteDocument(docId: string, fileName: string) {
    try {
      //  Delete from Chroma
      await this.chromaService.deleteByDocId(docId);

      //  Delete file from uploads folder
      const filePath = `uploads/${fileName}`;

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return {
        message: "Document deleted successfully",
      };

    } catch (error) {
      console.error("DELETE ERROR:", error);
      throw new BadRequestException("Failed to delete document");
    }
  }
}