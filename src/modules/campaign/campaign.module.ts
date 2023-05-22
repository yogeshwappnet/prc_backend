import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';
import { CampaignSchema } from '../../schema/campaign.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModule } from 'src/modules/message/message.module';
import { FreshworkModule } from 'src/modules/freshwork/freshwork.module';
import { ScheduleMessageModule } from '../schedule-message/schedule-message.module';
import { SlackModule } from 'nestjs-slack';
import { ConversationModule } from '../conversation/conversation.module';
import { TwilioModule } from '../twilio/twilio.module';
import { MessageLogModule } from '../message-log/message-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'campaign',
        schema: CampaignSchema,
      },
    ]),
    SlackModule.forRoot({
      type: 'webhook',
      url: 'https://hooks.slack.com/services/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',
    }),
    MessageModule,
    FreshworkModule,
    ScheduleMessageModule,
    ConversationModule,
    TwilioModule,
    MessageLogModule,
  ],
  controllers: [CampaignController],
  providers: [CampaignService],
  exports: [CampaignService],
})
export class CampaignModule {}
