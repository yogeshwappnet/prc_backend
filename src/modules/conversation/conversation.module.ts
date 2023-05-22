import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { ConversationSchema } from 'src/schema/conversation.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { FreshworkModule } from '../freshwork/freshwork.module';
import { SlackModule } from 'nestjs-slack';
import { MessageLogModule } from '../message-log/message-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'conversation',
        schema: ConversationSchema,
      },
    ]),
    FreshworkModule,
    SlackModule.forRoot({
      type: 'webhook',
      url: 'https://hooks.slack.com/services/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',
    }),
    MessageLogModule,
  ],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
