import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) { }
  @Post()
  async ask(
    @Body() body: { question: string; docId: string }
  ) {
    const { question, docId } = body;

    return this.chatService.ask(question, docId);
  }
}
