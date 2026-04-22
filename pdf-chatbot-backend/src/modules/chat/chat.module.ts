import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { EmbeddingModule } from '../embedding/embedding.module';
import { VectorStoreModule } from '../vector-store/vector-store.module';
import { LLMModule } from '../llm/llm.module';
import { VectorDbModule } from '../vector-db/vector-db.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './chat.schema';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Chat.name, schema: ChatSchema }
  ]),
    EmbeddingModule, VectorStoreModule, LLMModule, VectorDbModule, PdfModule],
  controllers: [ChatController],
  providers: [ChatService]
})
export class ChatModule { }
