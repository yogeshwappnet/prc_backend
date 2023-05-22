import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, SchemaTypes } from 'mongoose';

export type ScheduleMessageDocument = ScheduledMessage & Document;

@Schema()
export class ScheduledMessage {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Campaigns' })
  campaignId: ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Messages' })
  messageId: ObjectId;

  @Prop()
  contactId: string;

  @Prop()
  sentTime: string;

  @Prop()
  sentDate: string;

  @Prop()
  isSent: boolean;

  @Prop()
  isDeleted: boolean;
}

export const ScheduleMessageSchema =
  SchemaFactory.createForClass(ScheduledMessage);
