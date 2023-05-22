import { Response } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { AuthGuard } from '../auth/auth.guard';
import { FreshworkService } from '../freshwork/freshwork.service';
import { SlackService } from 'nestjs-slack';
import { MessageLogService } from '../message-log/message-log.service';

@Controller('conversation')
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly freshworkService: FreshworkService,
    private readonly messageLogService: MessageLogService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('find')
  async findAllById(@Body() body: any, @Res() response: Response) {
    try {
      const resp = await this.conversationService.findById(
        body.campaignId,
        body.to,
      );
      return response
        .status(HttpStatus.OK)
        .send({ message: ['Conversation'], data: resp });
    } catch (error) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: ['Something went wrong'], error: error });
    }
  }

  @UseGuards(AuthGuard)
  @Get('campaign/:id')
  async getAllConversationForCampaign(
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    try {
      const tempConversation = await this.conversationService.findByCampaignId(
        id,
      );
      const conversations = JSON.parse(JSON.stringify(tempConversation));
      for (let index = 0; index < conversations.length; index++) {
        const conversation = conversations[index];
        conversation['contact'] = await this.freshworkService.getContactDetails(
          conversation.contactId,
        );
        conversation['last_message'] =
          await this.messageLogService.findByLastConversation(conversation._id);
      }

      return response
        .status(HttpStatus.OK)
        .send({ message: ['Conversation'], data: conversations });
    } catch (error) {
      console.log(error);
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: ['Something went wrong'], error: error });
    }
  }
}
