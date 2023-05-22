import { Response } from 'express';
import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { MessageLogService } from './message-log.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('message-log')
export class MessageLogController {
  constructor(private messageLogService: MessageLogService) {}

  @UseGuards(AuthGuard)
  @Get(':id')
  async findLogFromNumber(@Param('id') id: string, @Res() response: Response) {
    try {
      const message = await this.messageLogService.findByNumber(id);
      return response
        .status(HttpStatus.OK)
        .send({ message: ['Message log'], data: message });
    } catch (error) {
      console.log(error);
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: ['Something went wrong'], error: error });
    }
  }

  @UseGuards(AuthGuard)
  @Get('conversation/:id')
  async findAllById(@Param('id') id: string, @Res() response: Response) {
    try {
      const message = await this.messageLogService.findByConversation(id);
      return response
        .status(HttpStatus.OK)
        .send({ message: ['Message log'], data: message });
    } catch (error) {
      console.log(error);
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: ['Something went wrong'], error: error });
    }
  }
}
