import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScheduledMessageDto } from 'src/dto/schedule-mssage.dto';
import { ScheduleMessageDocument } from 'src/schema/schedule-message.schema';

@Injectable()
export class ScheduleMessageService {
  constructor(
    @InjectModel('schedule-message')
    private readonly scheduleMessageModel: Model<ScheduleMessageDocument>,
  ) {}

  async createMany(
    scheduleMessageDtos: ScheduledMessageDto[],
  ): Promise<ScheduleMessageDocument[]> {
    return this.scheduleMessageModel.insertMany(scheduleMessageDtos);
  }

  async findAllById(id: string): Promise<ScheduleMessageDocument[]> {
    return this.scheduleMessageModel
      .find()
      .where('campaignId')
      .equals(id)
      .where('isSent')
      .equals(false)
      .where('isDeleted')
      .equals(false)
      .exec();
  }

  async update(
    id: string,
    scheduleMessage: ScheduledMessageDto,
  ): Promise<ScheduledMessageDto> {
    return this.scheduleMessageModel.findByIdAndUpdate(id, scheduleMessage);
  }
}
