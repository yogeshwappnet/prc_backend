import { Filter } from './filter.entity';

export class Campaign {
  name: string;
  status: string;
  forwardIncomingCall: boolean;
  forwardIncomingCallNumber: string;
  receipts: number;
  replies: number;
  filter: [Filter];
  timeOfDay: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
