import { PartialType } from '@nestjs/mapped-types';
import { SaveCampaignDto } from './create-campaign.dto';

export class UpdateCampaignDto extends PartialType(SaveCampaignDto) {}
