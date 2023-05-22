import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ScheduleMessageService } from './schedule-message.service';
import { Response } from 'express';
import { DateTime } from 'luxon';
import { FreshworkService } from '../freshwork/freshwork.service';
import { TwilioService } from '../twilio/twilio.service';
import { MessageService } from '../message/message.service';
import { SlackService } from 'nestjs-slack';
import { ConversationService } from '../conversation/conversation.service';
import { MessageLogService } from '../message-log/message-log.service';
import { CreateMessageLogDto } from 'src/dto/create-message-log.dto';
import { CreateConversationDto } from 'src/dto/create-conversation.dto';

@Controller('schedule-message')
export class ScheduleMessageController {
  constructor(
    private readonly freshworkService: FreshworkService,
    private readonly scheduleMessageService: ScheduleMessageService,
    private readonly twilioService: TwilioService,
    private readonly messageService: MessageService,
    private readonly slackService: SlackService,
    private readonly conversationService: ConversationService,
    private readonly messageLogService: MessageLogService,
  ) {}

  @UseGuards(AuthGuard)
  @Get(':id')
  async getMessages(@Param('id') id: string, @Res() response: Response) {
    try {
      const timeZoneDate = DateTime.now()
        .setZone('America/New_York')
        .toObject();
      let messages = await this.scheduleMessageService.findAllById(id);
      messages = messages.filter((message) => {
        const campaignHours = message.sentTime.slice(0, 2);
        const campaignMinutes = message.sentTime.slice(3, 5);
        const campaignMonth = message.sentDate.slice(5, 7);
        const campaignDate = message.sentDate.slice(8, 10);

        if (
          campaignHours == timeZoneDate.hour &&
          campaignMinutes == timeZoneDate.minute &&
          campaignDate == timeZoneDate.day &&
          campaignMonth == timeZoneDate.month
        ) {
          return message;
        }
      });

      for (let index = 0; index < messages.length; index++) {
        const message = messages[index];
        message['isSent'] = true;
        await this.scheduleMessageService.update(message.id, message);
        const campaignMessage = await this.messageService.findById(
          message.messageId,
        );

        const contactDetail = await this.freshworkService.getContactDetails(
          message.contactId,
        );
        // contactDetail.phone_numbers.length;
        this.slackService.sendText('Send message start');
        if (contactDetail?.phone_numbers?.length > 0) {
          for (
            let index = 0;
            index < contactDetail.phone_numbers.length;
            index++
          ) {
            const number = contactDetail.phone_numbers[index];
            const conversations = await this.conversationService.findById(
              id,
              number.value,
            );

            let conversation;
            const dateTime = DateTime.now().setZone('America/New_York');
            if (conversations.length == 0) {
              const createConversation: CreateConversationDto = {
                campaignId: message.campaignId,
                contactId: message.contactId,
                from: process.env.TWILIO_MESSAGE_SERVICE_ID,
                to: number.value,
                startDate: dateTime,
                hasCalled: false,
                hasReplied: false,
              };

              conversation = await this.conversationService.create(
                createConversation,
              );
            } else {
              conversation = conversations[0];
            }

            if (
              number.label == 'CELLULAR - Reonomy' &&
              conversation.hasCalled == false &&
              conversation.hasReplied == false
            ) {
              const messageText = campaignMessage.messageText.replace(
                '{contact.name}',
                contactDetail.display_name,
              );

              const resp = await this.twilioService.sendMessage(
                number.value,
                messageText,
              );
              this.slackService.sendText('Send message to :' + number.value);

              const createMessageLog: CreateMessageLogDto = {
                campaignId: message.campaignId,
                messageId: message.messageId,
                conversationId: conversation.id,
                contactId: message.contactId,
                messageSID: resp.sid,
                messageServiceID: resp.messaging_service_sid,
                messageText: resp.body,
                from: resp.from,
                to: resp.to,
                sentDateTime: dateTime,
                status: resp.status,
                isOutgoing: true,
              };

              await this.messageLogService.create(createMessageLog);
              await this.freshworkService.addMessageLog(
                resp.body,
                message.contactId,
              );
            } else {
              this.slackService.sendText(
                'Person has called or replied, message has been not sent to :' +
                  number.value,
              );
            }
          }
        }
      }

      return response.status(HttpStatus.OK).send({
        message: ['Campaign Message Sended Successfully'],
        data: {},
      });
    } catch (error) {
      console.log(error);
      await this.slackService.sendText('Error in sending sms');
      await this.slackService.sendText(JSON.stringify(error));
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: ['Something went wrong'], error: error });
    }
  }
}
