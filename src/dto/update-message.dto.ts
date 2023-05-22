import { PartialType } from '@nestjs/mapped-types';
import { Message } from 'src/entities/message.entity';

export class UpdateMessageDto extends PartialType(Message) {}
