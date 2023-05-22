import { Injectable } from '@nestjs/common';
import * as twilio from 'twilio';

@Injectable()
export class TwilioService {
  private client: twilio.Twilio;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }

  async sendMessage(to: string, body: string): Promise<any> {
    return this.client.messages.create({
      to,
      messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE_ID,
      body,
    });
  }
}
