import { ObjectId } from 'mongoose';

export class ScheduledMessage {
  campaignId: ObjectId;
  messageId: ObjectId;
  contactId: string;
  sentTime: string;
  isSent: boolean;
  isDeleted: boolean;
}
