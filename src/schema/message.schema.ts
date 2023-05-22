import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, SchemaTypes } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop()
  messageNumber: string;

  @Prop()
  messageText: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Campaigns' })
  campaignId: ObjectId;

  @Prop()
  delay: string;

  @Prop()
  isDeleted: boolean;

  @Prop()
  createdAt: string;

  @Prop()
  updatedAt: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
