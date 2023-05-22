import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMessageLogDto } from 'src/dto/create-message-log.dto';
import { UpdateMessageLogDto } from 'src/dto/update-message-log.dto';
import { MessageLogDocument } from 'src/schema/message-log.schema';

@Injectable()
export class MessageLogService {
  constructor(
    @InjectModel('message-log')
    private readonly messageLogModel: Model<MessageLogDocument>,
  ) {}

  async create(
    messageLogDto: CreateMessageLogDto,
  ): Promise<MessageLogDocument> {
    const messageLog = new this.messageLogModel(messageLogDto);
    return messageLog.save();
  }

  async update(
    id: string,
    updateMessageLogDto: UpdateMessageLogDto,
  ): Promise<MessageLogDocument> {
    return this.messageLogModel.findByIdAndUpdate(id, updateMessageLogDto);
  }

  async find(messageSID: string): Promise<MessageLogDocument[]> {
    return this.messageLogModel
      .find()
      .where('messageSID')
      .equals(messageSID)
      .exec();
  }

  async findByConversation(
    conversationId: string,
  ): Promise<MessageLogDocument[]> {
    return this.messageLogModel
      .find()
      .where('conversationId')
      .equals(conversationId)
      .exec();
  }

  async findByLastConversation(conversationId): Promise<MessageLogDocument[]> {
    return this.messageLogModel
      .find()
      .where('conversationId')
      .equals(conversationId)
      .sort({ _id: -1 })
      .limit(1)
      .exec();
  }
  async findByNumber(to: string): Promise<MessageLogDocument[]> {
    return this.messageLogModel.find().where('to').equals(to).exec();
  }
}
