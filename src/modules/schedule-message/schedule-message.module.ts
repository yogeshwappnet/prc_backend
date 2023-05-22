import { Module } from '@nestjs/common';
import { ScheduleMessageController } from './schedule-message.controller';
import { ScheduleMessageService } from './schedule-message.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleMessageSchema } from 'src/schema/schedule-message.schema';
import { FreshworkModule } from '../freshwork/freshwork.module';
import { TwilioModule } from '../twilio/twilio.module';
import { MessageModule } from '../message/message.module';
import { SlackModule } from 'nestjs-slack';
import { MessageLogModule } from '../message-log/message-log.module';
import { ConversationModule } from '../conversation/conversation.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'schedule-message',
        schema: ScheduleMessageSchema,
      },
    ]),
    SlackModule.forRoot({
      type: 'webhook',
      url: 'https://hooks.slack.com/services/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',
    }),
    FreshworkModule,
    TwilioModule,
    MessageModule,
    MessageLogModule,
    ConversationModule,
  ],
  controllers: [ScheduleMessageController],
  providers: [ScheduleMessageService],
  exports: [ScheduleMessageService],
})
export class ScheduleMessageModule {}
