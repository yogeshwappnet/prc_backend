import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageLogDto } from './create-message-log.dto';

export class UpdateMessageLogDto extends PartialType(CreateMessageLogDto) {}
