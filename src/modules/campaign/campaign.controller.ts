import { Response } from 'express';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import {
  CreateCampaignDto,
  SaveCampaignDto,
} from '../../dto/create-campaign.dto';
import { UpdateCampaignDto } from '../../dto/update-campaign.dto';
import { MessageService } from 'src/modules/message/message.service';
import { Message } from 'src/entities/message.entity';
import { DateTime } from 'luxon';
import { FreshworkService } from 'src/modules/freshwork/freshwork.service';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { ScheduleMessageService } from '../schedule-message/schedule-message.service';
import { SlackService } from 'nestjs-slack';
import { ConversationService } from '../conversation/conversation.service';
import { CreateConversationDto } from 'src/dto/create-conversation.dto';
import { CreateMessageLogDto } from 'src/dto/create-message-log.dto';
import { TwilioService } from '../twilio/twilio.service';
import { MessageLogService } from '../message-log/message-log.service';

@Controller('campaign')
export class CampaignController {
  constructor(
    private readonly slackService: SlackService,
    private readonly campaignService: CampaignService,
    private readonly messageService: MessageService,
    private readonly freshworkService: FreshworkService,
    private readonly scheduleMessageService: ScheduleMessageService,
    private readonly conversationService: ConversationService,
    private readonly twilioService: TwilioService,
    private readonly messageLogService: MessageLogService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() saveCampaignDto: SaveCampaignDto,
    @Res() response: Response,
  ) {
    const campaignObject: CreateCampaignDto = {
      name: saveCampaignDto.name,
      status: saveCampaignDto.status || 'Inactive',
      forwardIncomingCall: true,
      forwardIncomingCallNumber: saveCampaignDto.forwardIncomingCallNumber,
      receipts: saveCampaignDto.receipts || 0,
      filter: saveCampaignDto.filter,
      timeOfDay: saveCampaignDto.timeOfDay,
      isDeleted: false,
      createdAt: new Date().toString(),
      updatedAt: new Date().toString(),
      replies: 0,
    };
    try {
      const campaign = await this.campaignService.create(campaignObject);
      if (campaign) {
        let messages = JSON.parse(JSON.stringify(saveCampaignDto.messages));
        messages = messages.map((message: Message) => {
          message['campaignId'] = campaign._id;
          message['isActive'] = true;
          message['isDeleted'] = false;
          message['createdAt'] = new Date().toString();
          message['updatedAt'] = new Date().toString();
          return message;
        });
        await this.messageService.createMany(messages);
      }
      return response
        .status(HttpStatus.OK)
        .send({ message: ['Campaign Added Successfully'], data: campaign });
    } catch (error) {
      this.slackService.sendText('Error in create Campaign');
      this.slackService.sendText(JSON.stringify(error));
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: ['Something went wrong'], error: error });
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Res() response: Response) {
    // eslint-disable-next-line prefer-const
    let campaigns = await this.campaignService.findAll();

    for (let index = 0; index < campaigns.length; index++) {
      const conversations = await this.conversationService.findByCampaignId(
        campaigns[index].id,
      );

      const repliedConversations =
        await this.conversationService.findRepliedConversationByCampaignId(
          campaigns[index].id,
        );
      campaigns[index]['receipts'] = conversations.length;
      campaigns[index]['replies'] = repliedConversations.length || 0;
    }

    return response
      .status(HttpStatus.OK)
      .send({ message: ['Campaigns'], data: campaigns });
  }

  // this will give a list of all the campaigns which are active and time of the day is same as current time
  @UseGuards(AuthGuard)
  @Get('start')
  async getCampaignsToStart(@Res() response: Response) {
    try {
      let allCampaigns = await this.campaignService.findAll();
      const timeZoneDate = DateTime.now()
        .setZone('America/New_York')
        .toObject();

      allCampaigns = allCampaigns.filter((campaign) => {
        const campaignHours = Number(campaign.timeOfDay.slice(0, 2));
        const campaignMinutes = Number(campaign.timeOfDay.slice(3, 5));
        if (
          campaignHours == timeZoneDate.hour &&
          campaignMinutes == timeZoneDate.minute &&
          campaign.status == 'Active'
        ) {
          return campaign;
        }
      });

      return response
        .status(HttpStatus.OK)
        .send({ message: ['Campaign Data'], data: allCampaigns });
    } catch (error) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: ['Something went wrong'], error: error });
    }
  }

  // this will schedule message and sent first message
  @UseGuards(AuthGuard)
  @Get('start/:id')
  async startCampaign(@Param('id') id: string, @Res() response: Response) {
    try {
      const campaign = await this.campaignService.findOne(id);
      if (campaign.status == 'Active') {
        const messages = await this.messageService.findAllById(campaign.id);
        const filterData = campaign.filter;
        const accFilterData = [];
        const contFilterData = [];

        if (filterData.length > 0) {
          filterData.forEach((element) => {
            if (element.tableName == 'sales_account') {
              accFilterData.push({
                attribute: element.attribute,
                operator: element.operator,
                value: element.value,
              });
            } else {
              contFilterData.push({
                attribute: element.attribute,
                operator: element.operator,
                value: element.value,
              });
            }
          });
        }

        const accounts = await this.freshworkService.getFilteredAccountList(
          accFilterData,
        );
        const accountName = [];
        accounts.forEach((acc) => {
          accountName.push(acc.name);
        });

        contFilterData.push({
          attribute: 'sales_account.name',
          operator: 'contains_any',
          value: accountName,
        });

        const contacts = await this.freshworkService.getFilteredContactsList(
          contFilterData,
        );

        const timeZoneDate = DateTime.now()
          .setZone('America/New_York')
          .toObject();

        const campaignHours = campaign.timeOfDay.slice(0, 2);
        const campaignMinutes = campaign.timeOfDay.slice(3, 5);

        let isNextDay = false;
        if (
          timeZoneDate.hour < campaignHours ||
          (timeZoneDate.minute <= campaignMinutes &&
            timeZoneDate.hour <= campaignHours)
        ) {
          isNextDay = false;
        } else {
          isNextDay = true;
        }

        for (let j = 0; j < messages.length; j++) {
          const scheduledMessages: any = [];
          let messageSentDate = DateTime.now().setZone('America/New_York');
          if (messages[j].delay) {
            const day = Number(messages[j].delay) + (isNextDay ? 1 : 0);

            messageSentDate = DateTime.now().setZone('America/New_York').plus({
              days: day,
            });
          }
          for (let index = 0; index < contacts.length; index++) {
            const contact = contacts[index];
            const contactConversation =
              await this.conversationService.findConversationByContact(
                contact.id,
                campaign._id,
              );

            if ((contactConversation.length == 0 && j == 0) || j > 0) {
              scheduledMessages.push({
                campaignId: campaign.id,
                messageId: messages[j].id,
                contactId: contact.id,
                sentTime: campaign.timeOfDay,
                sentDate: messageSentDate,
                isSent: j == 0 ? true : false,
                isDeleted: false,
              });

              const fullContact = await this.freshworkService.getContactDetails(
                contact.id,
              );

              // for first message only
              if (j == 0) {
                if (fullContact?.phone_numbers?.length > 0) {
                  for (
                    let tempIndex = 0;
                    tempIndex < fullContact.phone_numbers.length;
                    tempIndex++
                  ) {
                    const number = fullContact.phone_numbers[tempIndex];
                    const conversations =
                      await this.conversationService.findById(id, number.value);

                    let conversation;
                    const dateTime = DateTime.now().setZone('America/New_York');
                    if (conversations.length == 0) {
                      const createConversation: CreateConversationDto = {
                        campaignId: campaign._id,
                        contactId: fullContact.id,
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
                      const messageText = messages[j].messageText.replace(
                        '{contact.name}',
                        contact.display_name,
                      );

                      this.slackService.sendText(
                        'Send message to :' + messageText,
                      );

                      const resp = await this.twilioService.sendMessage(
                        number.value,
                        messageText,
                      );
                      this.slackService.sendText(
                        'Send message to :' + number.value,
                      );

                      const createMessageLog: CreateMessageLogDto = {
                        campaignId: campaign._id,
                        messageId: messages[j]._id,
                        conversationId: conversation.id,
                        contactId: fullContact.id,
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
                        fullContact.id,
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

              await this.freshworkService.updateContact(
                campaign.name,
                contact.id,
              );

              await this.freshworkService.updateAccount(
                campaign.name,
                fullContact.sales_accounts[0].id,
              );
            }
          }
          await this.scheduleMessageService.createMany(scheduledMessages);
        }
        return response
          .status(HttpStatus.OK)
          .send({ message: ['Campaign Added Successfully'], data: campaign });
      } else {
        return response
          .status(HttpStatus.OK)
          .send({ message: ['Campaign is not active yet'], data: campaign });
      }
    } catch (error) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: ['Something went wrong'], error: error });
    }
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() response: Response) {
    try {
      const campaign = await this.campaignService.findOne(id);
      const messages = await this.messageService.findAllById(campaign.id);
      const hasCalledConversations =
        await this.conversationService.findCalledConversationByCampaignId(
          campaign.id,
        );
      const hasRepliedConversations =
        await this.conversationService.findRepliedConversationByCampaignId(
          campaign.id,
        );
      return response.status(HttpStatus.OK).send({
        message: ['Campaign Details'],
        data: {
          campaign,
          message: messages,
          hasReplied: hasRepliedConversations.length || 0,
          hasCalled: hasCalledConversations.length || 0,
        },
      });
    } catch (error) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: ['Something went wrong'], error: error });
    }
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @Res() response: Response,
  ) {
    try {
      const campaignObject: UpdateCampaignDto = {
        name: updateCampaignDto.name,
        status: updateCampaignDto.status,
        forwardIncomingCall: updateCampaignDto.forwardIncomingCall,
        forwardIncomingCallNumber: updateCampaignDto.forwardIncomingCallNumber,
        filter: updateCampaignDto.filter,
        receipts: updateCampaignDto.receipts,
        timeOfDay: updateCampaignDto.timeOfDay,
        updatedAt: new Date().toString(),
      };
      const campaign = this.campaignService.update(id, campaignObject);

      if (campaign) {
        let messages = JSON.parse(JSON.stringify(updateCampaignDto.messages));
        messages = messages.map((message: Message) => {
          if (message['_id']) {
            message['_id'] = message['_id'];
            message['updatedAt'] = new Date().toString();
          } else {
            message['campaignId'] = Object(id);
            message['isActive'] = true;
            message['isDeleted'] = false;
            message['createdAt'] = new Date().toString();
            message['updatedAt'] = new Date().toString();
          }
          return message;
        });
        for (let index = 0; index < messages.length; index++) {
          const message = messages[index];
          if (message._id) {
            await this.messageService.update(message._id, message);
          } else {
            await this.messageService.create(message);
          }
        }
      }
      return response
        .status(HttpStatus.OK)
        .send({ message: ['Campaign Updated Successfully'], data: campaign });
    } catch (error) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: ['Something went wrong'], error: error });
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.campaignService.remove(id);
  }
}
