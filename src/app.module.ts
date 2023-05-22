import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignModule } from './modules/campaign/campaign.module';
import { MessageModule } from './modules/message/message.module';
import { FreshworkModule } from './modules/freshwork/freshwork.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FilterModule } from './modules/filter/filter.module';
import { ScheduleMessageModule } from './modules/schedule-message/schedule-message.module';
import { TwilioModule } from './modules/twilio/twilio.module';
import { SlackModule } from 'nestjs-slack';
import { MessageLogModule } from './modules/message-log/message-log.module';
import { ConversationModule } from './modules/conversation/conversation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SlackModule.forRoot({
      type: 'webhook',
      url: 'https://hooks.slack.com/services/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',
    }),
    MongooseModule.forRoot(process.env.DATABASE_CONNECTION),
    CampaignModule,
    MessageModule,
    FreshworkModule,
    AuthModule,
    UsersModule,
    FilterModule,
    ScheduleMessageModule,
    TwilioModule,
    MessageLogModule,
    ConversationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
