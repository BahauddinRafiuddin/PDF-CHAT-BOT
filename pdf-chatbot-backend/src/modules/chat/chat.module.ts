import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { EmbeddingModule } from '../embedding/embedding.module';
import { VectorStoreModule } from '../vector-store/vector-store.module';
import { LLMModule } from '../llm/llm.module';
import { VectorDbModule } from '../vector-db/vector-db.module';

@Module({
  imports:[EmbeddingModule,VectorStoreModule,LLMModule,VectorDbModule],
  controllers: [ChatController],
  providers: [ChatService]
})
export class ChatModule {}
