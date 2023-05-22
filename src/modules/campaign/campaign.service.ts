import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCampaignDto } from '../../dto/create-campaign.dto';
import { UpdateCampaignDto } from '../../dto/update-campaign.dto';
import { CampaignDocument } from '../../schema/campaign.schema';

@Injectable()
export class CampaignService {
  constructor(
    @InjectModel('campaign')
    private readonly campaignModel: Model<CampaignDocument>,
  ) {}

  async create(
    createCampaignDto: CreateCampaignDto,
  ): Promise<CampaignDocument> {
    const campaign = new this.campaignModel(createCampaignDto);
    return campaign.save();
  }

  async findAll(): Promise<CampaignDocument[]> {
    return this.campaignModel.find().where('isDeleted').equals(false).exec();
  }

  async findOne(id: string) {
    return this.campaignModel.findById(id).where('isDeleted').equals(false);
  }

  async update(
    id: string,
    updateCampaignDto: UpdateCampaignDto,
  ): Promise<CampaignDocument> {
    return this.campaignModel.findByIdAndUpdate(id, updateCampaignDto);
  }

  async remove(id: string) {
    return this.campaignModel.findByIdAndRemove(id);
  }
}
