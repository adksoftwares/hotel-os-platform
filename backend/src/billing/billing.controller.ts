import { Controller, Post, Body } from '@nestjs/common';
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
  async createIntent(@AuthUser() user: any, @Body() body: any) {
    // Simulating returning a Stripe PaymentIntent client secret.
    // This allows the client to process card payments directly via Stripe,
    // ensuring we never touch raw PCI-DSS card data.
    const amount = body.amount || 0;
    return {
      clientSecret: `pi_test_${Math.random().toString(36).substring(2, 15)}_secret_${Math.random().toString(36).substring(2, 15)}`,
      amount,
      currency: 'usd',
    };
  }
}
