import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ default: 'New Chat' })
  title!: string;

  @Prop()
  docId!: string;

  @Prop()
  fileName!: string;

  @Prop({ default: false })
  hasPdf!: boolean;

  @Prop({
    type: [
      {
        role: String,
        content: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  messages!: {
    role: string;
    content: string;
    createdAt: Date;
  }[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);