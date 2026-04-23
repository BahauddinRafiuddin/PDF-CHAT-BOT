import { Body, Controller, Delete, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './config/multer.config';

@Controller('pdf')
export class PdfController {
  constructor(private pdfService: PdfService) {
  }

  // @Post('upload')
  // @UseInterceptors(FileInterceptor('file', multerConfig))
  // async uploadPdf(@UploadedFile() file: Express.Multer.File) {
  //   return this.pdfService.processPdf(file)
  // }

  // @Delete('delete')
  // async delete(@Body() body: { docId: string; storedFileName: string }) {
  //   const { docId, storedFileName } = body;

  //   return this.pdfService.deleteDocument(docId, storedFileName);
  // }
}
