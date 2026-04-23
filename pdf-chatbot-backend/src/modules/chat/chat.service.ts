import { Injectable } from '@nestjs/common';
import { EmbeddingService } from '../embedding/embedding.service';
import { LLMService } from '../llm/llm.service';
import { ChromaService } from '../vector-db/chroma.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from './chat.schema';
import { PdfService } from '../pdf/pdf.service';

@Injectable()
export class ChatService {
  constructor(
    private embeddingService: EmbeddingService,
    private llmService: LLMService,
    private chromaService: ChromaService,
    private pdfService: PdfService,
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
  ) { }

  async createChat() {
    const chat = await this.chatModel.create({
      title: 'New Chat',
    });

    return chat;
  }

  async ask(question: string, docId: string) {
    // Step 1: Convert question → embedding
    const queryEmbedding = await this.embeddingService.generateEmbedding(question);

    // Step 2: Query Chroma
    const result = await this.chromaService.query(queryEmbedding, {
      docId,
    });

    const contextDocs = result?.documents?.[0] || [];

    if (!contextDocs.length) {
      return {
        answer: "I don't know",
      };
    }

    const context = contextDocs.join('\n\n');

    // Step 3: Prompt
    const prompt = `
    You are a strict AI assistant.

    You must answer ONLY using the provided context.

    Rules:
    - If part of the question is NOT in the context, ignore that part.
    - Do NOT generate any extra knowledge.
    - Do NOT write code unless it is present in the context.
    - If the answer is not found, say: "I don't know".

    Context:
    ${context}

    Question:
    ${question}

    Answer:
    `;

    // Step 4: Generate answer
    const answer = await this.llmService.generateResponse(prompt);

    return {
      answer,
      sources: contextDocs,
    };
  }

  async sendMessage(chatId: string, question: string) {
    const chat = await this.chatModel.findById(chatId);

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (!chat.docId) {
      return { answer: 'Upload a PDF first' };
    }

    // Save user message
    chat.messages.push({
      role: 'user',
      content: question,
      createdAt: new Date(),
    });

    // Run RAG
    const response = await this.ask(question, chat.docId);

    // Save AI response
    chat.messages.push({
      role: 'assistant',
      content: response.answer,
      createdAt: new Date(),
    });

    await chat.save();

    return response;
  }

  async uploadPdfToChat(chatId: string, file: Express.Multer.File) {
    const chat = await this.chatModel.findById(chatId);

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (chat.hasPdf) {
      throw new Error('PDF already exists in this chat');
    }

    // 🔥 Use your existing PDF pipeline
    const result = await this.pdfService.processPdf(file);

    // Attach to chat
    chat.docId = result.docId;
    chat.fileName = file.originalname;
    chat.storedFileName = file.filename;
    chat.hasPdf = true;

    await chat.save();

    return {
      message: 'PDF uploaded and linked to chat',
      docId: result.docId,
      fileName: file.originalname, 
    };
  }

  async getAllChats() {
    return this.chatModel
      .find()
      .select('_id title fileName hasPdf createdAt')
      .sort({ createdAt: -1 });
  }

  async getChatById(chatId: string) {
    const chat = await this.chatModel.findById(chatId);

    if (!chat) {
      throw new Error('Chat not found');
    }

    return chat;
  }

  async deleteChat(chatId: string) {
    const chat = await this.chatModel.findById(chatId);

    if (!chat) {
      throw new Error('Chat not found');
    }

    //  delete vectors from Chroma
    if (chat.docId) {
      await this.chromaService.deleteByDocId(chat.docId);
    }

    //  delete PDF file
    if (chat.fileName) {
      const fs = require('fs');
      const path = `uploads/${chat.storedFileName}`;

      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
      }
    }

    await this.chatModel.findByIdAndDelete(chatId);

    return { message: 'Chat deleted successfully' };
  }

  async updateTitle(chatId: string, title: string) {
    const chat = await this.chatModel.findByIdAndUpdate(
      chatId,
      { title },
      { new: true }
    );

    if (!chat) {
      throw new Error('Chat not found');
    }

    return chat;
  }
}
