import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageDocument } from 'src/schema/message.schema';
import { CreateMessageDto } from 'src/dto/create-message.dto';
import { UpdateMessageDto } from 'src/dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('message')
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<MessageDocument> {
    const message = new this.messageModel(createMessageDto);
    return message.save();
  }

  async createMany(
    createMessageDtos: CreateMessageDto[],
  ): Promise<MessageDocument[]> {
    return this.messageModel.insertMany(createMessageDtos);
  }

  async update(
    id: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<MessageDocument> {
    return this.messageModel.findByIdAndUpdate(id, updateMessageDto);
  }

  async findAllById(id: string): Promise<MessageDocument[]> {
    return this.messageModel
      .find()
      .where('campaignId')
      .equals(id)
      .where('isDeleted')
      .equals(false)
      .exec();
  }

  async findById(id): Promise<MessageDocument> {
    return this.messageModel.findById(id).where('isDeleted').equals(false);
  }
}
