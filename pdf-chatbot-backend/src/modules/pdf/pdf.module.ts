import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { EmbeddingModule } from '../embedding/embedding.module';

@Module({
  imports:[EmbeddingModule],
  controllers: [PdfController],
  providers: [PdfService]
})
export class PdfModule {}
