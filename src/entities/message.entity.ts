import { ObjectId } from 'mongoose';

export class Message {
  campaignId: ObjectId;
  messageNumber: string;
  messageText: string;
  delay: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
