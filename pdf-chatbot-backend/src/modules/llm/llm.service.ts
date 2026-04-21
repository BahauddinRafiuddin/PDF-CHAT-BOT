import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';

@Injectable()
export class LLMService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async generateResponse(prompt: string): Promise<string> {
    const response = await this.groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return response.choices[0]?.message?.content || '';
  }
}