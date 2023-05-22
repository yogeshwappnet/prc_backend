import { Response } from 'express';
import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SlackService } from 'nestjs-slack';
import { TwilioService } from './twilio.service';
import { MessageLogService } from '../message-log/message-log.service';
import { ConversationService } from '../conversation/conversation.service';
import { CreateMessageLogDto } from 'src/dto/create-message-log.dto';
import { DateTime } from 'luxon';
import * as twilio from 'twilio';
import { CampaignService } from '../campaign/campaign.service';
import { AuthGuard } from '../auth/auth.guard';
import { FreshworkService } from '../freshwork/freshwork.service';

@Controller('twilio')
export class TwilioController {
  constructor(
    private readonly slackService: SlackService,
    private twilioService: TwilioService,
    private messageLogService: MessageLogService,
    private conversationService: ConversationService,
    private campaignService: CampaignService,
    private freshworkService: FreshworkService,
  ) {}

  // method for twilio to update the message delivery
  @Post('sms-send')
  async logSMS(@Body() body: any, @Res() response: Response) {
    try {
      const messages = await this.messageLogService.find(body.SmsSid);
      const message = messages[0];
      message['status'] = body?.SmsStatus;
      message['from'] = body?.From;
      await this.messageLogService.update(message.id, message);
      return response
        .status(HttpStatus.OK)
        .send({ message: ['Twilio'], data: 'Success' });
    } catch (error) {
      console.log(error);
      await this.slackService.sendText('Error in sms-send');

      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: ['Something went wrong'], error: error });
    }
  }

  // method for twilio to update the conversation
  @Post('sms-receive')
  async receiveSMS(@Body() body: any, @Res() response: Response) {
    try {
      const messages = await this.messageLogService.findByNumber(body.From);
      let message;
      if (messages.length > 1) {
        message = messages[messages.length - 1];
      } else {
        message = messages[0];
      }
      const conversation = await this.conversationService.findOne(
        message.conversationId,
      );

      conversation['hasReplied'] = true;
      await this.conversationService.update(conversation._id, conversation);
      const dateTime = DateTime.now().setZone('America/New_York');
      const incomingMessage: CreateMessageLogDto = {
        campaignId: conversation.campaignId,
        messageId: message.messageId,
        conversationId: conversation.id,
        contactId: conversation.contactId,
        messageSID: body.SmsSid,
        messageServiceID: body.MessagingServiceSid,
        messageText: body.Body,
        from: body.From,
        to: body.To,
        sentDateTime: dateTime,
        status: body.SmsStatus,
        isOutgoing: false,
      };
      await this.freshworkService.addMessageLog(
        body.Body,
        message.contactId,
        true,
      );
      await this.messageLogService.create(incomingMessage);
      return response
        .status(HttpStatus.OK)
        .send({ message: ['Twilio'], data: 'Success' });
    } catch (error) {
      await this.slackService.sendText('Error in sms-receive');
      await this.slackService.sendText(error);
      console.log(error);
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: ['Something went wrong'], error: error });
    }
  }

  // method to send new sms from twilio
  @Post('send-sms')
  async sendSMS(@Body() body: any, @Res() response: Response) {
    try {
      await this.twilioService.sendMessage(body.to, body.message);
      return response
        .status(HttpStatus.OK)
        .send({ message: ['Twilio'], data: 'success' });
    } catch (error) {
      await this.slackService.sendText('Error in send sms');
      console.log(error);
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: ['Something went wrong'], error: error });
    }
  }

  // method to forward incoming call from twilio
  @Post('call-receive')
  async forwardCall(@Body() body, res: Response) {
    console.log(body);
    this.slackService.sendText('Call receive from twilio');
    this.slackService.sendText(JSON.stringify(body));
    const messages = await this.messageLogService.findByNumber(body.From);
    let message;
    if (messages.length > 1) {
      await this.slackService.sendText('Messages found');
      message = messages[messages.length - 1];
    } else {
      await this.slackService.sendText('Message found');
      message = messages[0];
    }
    await this.slackService.sendText('Message : ' + message);
    await this.slackService.sendText('Campaign Id: ' + message.campaignId);
    const campaign = await this.campaignService.findOne(message.campaignId);
    const conversation = await this.conversationService.findOne(
      message.conversationId,
    );

    await this.slackService.sendText('Conversation found');
    conversation['hasCalled'] = true;
    await this.slackService.sendText(
      'Conversation' + JSON.stringify(conversation),
    );
    const updateConversation = await this.conversationService.update(
      conversation._id,
      conversation,
    );
    await this.slackService.sendText(
      'Update Conversation :' + updateConversation,
    );
    const dateTime = DateTime.now().setZone('America/New_York');
    const incomingMessage: CreateMessageLogDto = {
      campaignId: conversation.campaignId,
      messageId: message.messageId,
      conversationId: conversation.id,
      contactId: conversation.contactId,
      messageSID: body.SmsSid,
      messageServiceID: body.MessagingServiceSid,
      messageText: body.Body,
      from: body.From,
      to: body.To,
      sentDateTime: dateTime,
      status: 'Call Received',
      isOutgoing: false,
    };
    await this.freshworkService.addMessageLog(
      body.Body,
      message.contactId,
      true,
    );
    await this.messageLogService.create(incomingMessage);
    await this.slackService.sendText('Add Call log Conversation');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    const twiml = new twilio.twiml.VoiceResponse();
    twiml.dial(
      { callerId: process.env.TWILIO_PHONE_NUMBER },
      campaign.forwardIncomingCallNumber,
    );

    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());
  }

  @UseGuards(AuthGuard)
  @Post('sms')
  async sendMessage(@Body() body, @Res() response: Response) {
    try {
      const r = await this.twilioService.sendMessage(body.to, body.messageText);
      this.slackService.sendText(JSON.stringify(r));
      const dateTime = DateTime.now().setZone('America/New_York');
      const messageLog = {
        campaignId: body.campaignId,
        messageId: null,
        conversationId: body.conversationId,
        contactId: body.contactId,
        messageSID: r.sid,
        messageServiceID: r.messaging_service_sid,
        messageText: body.messageText,
        from: r.from,
        to: body.to,
        sentDateTime: dateTime,
        status: r.status,
        isOutgoing: true,
      };

      const resp = await this.messageLogService.create(messageLog);
      await this.freshworkService.addMessageLog(r.body, body.contactId);
      return response
        .status(HttpStatus.OK)
        .send({ message: ['Message has been sent'], data: resp });
    } catch (error) {
      console.log(error);
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: ['Something went wrong'], error: error });
    }
  }
}
