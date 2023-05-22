import { ObjectId } from 'mongoose';

export class MessageLog {
  campaignId: ObjectId;
  messageId: ObjectId;
  conversationId: ObjectId;
  contactId: string;
  messageSID: string;
  messageServiceID: string;
  messageText: string;
  from: string;
  to: string;
  sentDateTime: string;
  status: string;
  isOutgoing: boolean;
}
