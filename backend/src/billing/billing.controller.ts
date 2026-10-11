import { Controller, Post, Body, NotImplementedException } from '@nestjs/common';
import { BillingService } from './billing.service.js';
import { AuthUser } from '../auth/decorators/auth-user.decorator.js';

@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Post('process-payment')
  async processPayment(@AuthUser() user: any, @Body() body: any) {
    return this.billingService.processPayment(
      user.propertyId,
      body.folioId,
      body.amount,
      body.method,
      body.paymentReference,
      body.idempotencyKey,
      user.id
    );
  }

  @Post('refund')
  async processRefund(@AuthUser() user: any, @Body() body: any) {
    return this.billingService.processRefund(
      user.propertyId,
      body.paymentId,
      body.amount,
      body.reason,
      user.id
    );
  }

  @Post('intent')
  async createIntent(): Promise<never> {
    // A fabricated client secret is not a payment intent. Never tell clients
    // that a payment provider has authorized a transaction unless it has.
    throw new NotImplementedException(
      'Card payment intents are unavailable until a real payment provider is configured.'
    );
  }
}
