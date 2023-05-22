import { Module, forwardRef } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { TwilioController } from './twilio.controller';
import { SlackModule } from 'nestjs-slack';
import { MessageLogModule } from '../message-log/message-log.module';
import { ConversationModule } from '../conversation/conversation.module';
import { CampaignModule } from '../campaign/campaign.module';
import { FreshworkModule } from '../freshwork/freshwork.module';

@Module({
  imports: [
    SlackModule.forRoot({
      type: 'webhook',
      url: 'https://hooks.slack.com/services/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',
    }),
    MessageLogModule,
    ConversationModule,
    forwardRef(() => CampaignModule),
    FreshworkModule,
  ],
  providers: [TwilioService],
  controllers: [TwilioController],
  exports: [TwilioService],
})
export class TwilioModule {}
