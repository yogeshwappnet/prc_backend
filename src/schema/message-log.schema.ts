import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, SchemaTypes } from 'mongoose';

export type MessageLogDocument = MessageLog & Document;

@Schema()
export class MessageLog {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Campaigns' })
  campaignId: ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Messages' })
  messageId: ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Conversations' })
  conversationId: ObjectId;

  @Prop()
  contactId: string;

  @Prop()
  messageSID: string;

  @Prop()
  messageServiceID: string;

  @Prop()
  messageText: string;

  @Prop()
  from: string;

  @Prop()
  to: string;

  @Prop()
  sentDateTime: string;

  @Prop()
  status: string;

  @Prop()
  isOutgoing: boolean;
}

export const MessageLogSchema = SchemaFactory.createForClass(MessageLog);
