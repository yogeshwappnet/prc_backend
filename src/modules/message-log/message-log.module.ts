import { Module } from '@nestjs/common';
import { MessageLogService } from './message-log.service';
import { MessageLogController } from './message-log.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageLogSchema } from 'src/schema/message-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'message-log',
        schema: MessageLogSchema,
      },
    ]),
  ],
  providers: [MessageLogService],
  controllers: [MessageLogController],
  exports: [MessageLogService],
})
export class MessageLogModule {}
