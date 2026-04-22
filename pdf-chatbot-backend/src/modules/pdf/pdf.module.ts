import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { EmbeddingModule } from '../embedding/embedding.module';
import { VectorStoreModule } from '../vector-store/vector-store.module';
import { VectorDbModule } from '../vector-db/vector-db.module';

@Module({
  imports:[EmbeddingModule,VectorStoreModule,VectorDbModule],
  controllers: [PdfController],
  providers: [PdfService],
  exports:[PdfService]
})
export class PdfModule {}
