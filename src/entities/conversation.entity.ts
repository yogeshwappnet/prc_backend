import { ObjectId } from 'mongoose';

export class Conversation {
  campaignId: ObjectId;
  contactId: string;
  from: string;
  to: string;
  startDate: string;
  hasCalled: boolean;
  hasReplied: boolean;
}
