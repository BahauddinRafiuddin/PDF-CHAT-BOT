import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  Delete,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../pdf/config/multer.config';

@Controller('chats')
export class ChatController {
  constructor(private chatService: ChatService) {}

  //  Create chat
  @Post()
  createChat() {
    return this.chatService.createChat();
  }

  //  Get all chats (sidebar)
  @Get()
  getChats() {
    return this.chatService.getAllChats();
  }

  //  Get single chat (messages)
  @Get(':id')
  getChat(@Param('id') chatId: string) {
    return this.chatService.getChatById(chatId);
  }

  //  Send message (RAG)
  @Post(':id/message')
  sendMessage(
    @Param('id') chatId: string,
    @Body() body: { question: string }
  ) {
    return this.chatService.sendMessage(chatId, body.question);
  }

  //  Upload PDF to chat
  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  uploadPdf(
    @Param('id') chatId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.chatService.uploadPdfToChat(chatId, file);
  }

  //  Delete chat
  @Delete(':id')
  deleteChat(@Param('id') chatId: string) {
    return this.chatService.deleteChat(chatId);
  }

  //  Optional (nice UX)
  @Patch(':id/title')
  updateTitle(
    @Param('id') chatId: string,
    @Body() body: { title: string }
  ) {
    return this.chatService.updateTitle(chatId, body.title);
  }
}