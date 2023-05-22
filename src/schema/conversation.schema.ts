import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, SchemaTypes } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema()
export class Conversation {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Campaigns' })
  campaignId: ObjectId;

  @Prop()
  contactId: string;

  @Prop()
  from: string;

  @Prop()
  to: string;

  @Prop()
  startDate: string;

  @Prop()
  hasCalled: boolean;

  @Prop()
  hasReplied: boolean;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
