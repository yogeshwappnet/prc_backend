import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateConversationDto } from 'src/dto/create-conversation.dto';
import { UpdateConversationDto } from 'src/dto/update-conversation-log.dto';
import { ConversationDocument } from 'src/schema/conversation.schema';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel('conversation')
    private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  async create(
    conversationLogDto: CreateConversationDto,
  ): Promise<ConversationDocument> {
    const conversation = new this.conversationModel(conversationLogDto);
    return conversation.save();
  }

  async findById(id: string, to: string): Promise<ConversationDocument[]> {
    return this.conversationModel
      .find()
      .where('campaignId')
      .equals(id)
      .where('to')
      .equals(to)
      .exec();
  }

  async findByCampaignId(id: string): Promise<ConversationDocument[]> {
    return this.conversationModel.find().where('campaignId').equals(id).exec();
  }

  async findRepliedConversationByCampaignId(
    id: string,
  ): Promise<ConversationDocument[]> {
    return this.conversationModel
      .find()
      .where('hasReplied')
      .equals(true)
      .where('campaignId')
      .equals(id)
      .exec();
  }

  async findCalledConversationByCampaignId(
    id: string,
  ): Promise<ConversationDocument[]> {
    return this.conversationModel
      .find()
      .where('hasCalled')
      .equals(true)
      .where('campaignId')
      .equals(id)
      .exec();
  }

  async findConversationByContact(
    contactId: string,
    campaignId: string,
  ): Promise<ConversationDocument[]> {
    return this.conversationModel
      .find()
      .where('contactId')
      .equals(contactId)
      .where('campaignId')
      .equals(campaignId)
      .exec();
  }

  async findOne(id: string) {
    return this.conversationModel.findById(id);
  }

  async update(
    id: string,
    updateConversation: UpdateConversationDto,
  ): Promise<ConversationDocument> {
    return this.conversationModel.findByIdAndUpdate(id, updateConversation);
  }
}
