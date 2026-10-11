import { Controller, Post, NotImplementedException } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator.js';

@Controller('webhooks/booking')
export class OtaController {
  @Public()
  @Post()
  handleBookingWebhook(): never {
    // Do not acknowledge fabricated bookings. Enable this endpoint only after
    // a provider adapter, signature verification, replay protection, and
    // idempotent reservation mapping have been implemented.
    throw new NotImplementedException(
      'OTA webhook integration is not configured. No booking was created.'
    );
  }
}
