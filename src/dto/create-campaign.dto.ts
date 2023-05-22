import { Campaign } from '../entities/campaign.entity';
import { Message } from 'src/entities/message.entity';

export class CreateCampaignDto extends Campaign {}

export class SaveCampaignDto extends Campaign {
  messages: [Message];
}
