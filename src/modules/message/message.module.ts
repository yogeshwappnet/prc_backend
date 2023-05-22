import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageSchema } from 'src/schema/message.schema';
import { MessageService } from './message.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'message',
        schema: MessageSchema,
      },
    ]),
  ],
  controllers: [],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
