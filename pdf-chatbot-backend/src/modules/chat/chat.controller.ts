import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) { }
  @Post()
  async ask(@Body('question') question: string) {
    return this.chatService.ask(question);
  }
}
