import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Filter } from './filter.schema';

export type CampaignDocument = Campaign & Document;

@Schema()
export class Campaign {
  @Prop()
  name: string;

  @Prop()
  status: string;

  @Prop()
  forwardIncomingCall: boolean;

  @Prop()
  forwardIncomingCallNumber: string;

  @Prop()
  receipts: number;

  @Prop()
  replies: number;

  @Prop()
  filter: [Filter];

  @Prop()
  timeOfDay: string;

  @Prop()
  isDeleted: boolean;

  @Prop()
  createdAt: string;

  @Prop()
  updatedAt: string;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
