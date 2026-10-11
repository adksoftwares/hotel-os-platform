import { Controller, Post, Body } from '@nestjs/common';

@Controller('webhooks/booking')
export class OtaController {
  @Post()
  handleBookingWebhook(@Body() payload: any) {
    // Simulate mapping OTA payload to Reservation
    return {
      message: 'Booking webhook received',
      reservationId: 'RES-12345',
      source: payload?.source || 'OTA',
      mappedData: payload
    };
  }
}
