import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async processPayment(
    propertyId: string,
    folioId: string,
    amount: number,
    method: string,
    paymentReference: string,
    idempotencyKey: string,
    userId: string
  ) {
    // 1. Idempotency Check
    const existingPayment = await this.prisma.payment.findUnique({
      where: { idempotencyKey }
    });
    if (existingPayment) {
      return existingPayment; // Already processed, safely return original (Idempotency)
    }

    return this.prisma.$transaction(async (tx) => {
      const folio = await tx.folio.findUnique({ where: { id: folioId, propertyId } });
      if (!folio) throw new NotFoundException('Folio not found');

      // 2. Create Payment
      const payment = await tx.payment.create({
        data: {
          propertyId,
          folioId,
          amount,
          capturedAmount: amount, // Assuming direct capture for this flow
          method,
          status: PaymentStatus.CAPTURED,
          paymentReference,
          idempotencyKey
        }
      });

      // 3. Update Folio Status (Calculate totals, but keeping simple here for demo)
      // In real scenario, SUM all items - SUM all payments
      await tx.folio.update({
        where: { id: folioId },
        data: { status: 'PARTIALLY_SETTLED' } // Just an example state progression
      });

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          propertyId,
          userId,
          action: 'PROCESS_PAYMENT',
          entity: 'Payment',
          entityId: payment.id,
          after: JSON.stringify(payment),
          reason: 'Guest payment',
          timestamp: new Date()
        }
      });

      return payment;
    }, {
      isolationLevel: 'Serializable'
    });
  }

  async processRefund(
    propertyId: string,
    paymentId: string,
    amount: number,
    reason: string,
    userId: string
  ) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId, propertyId }
      });
      if (!payment) throw new NotFoundException('Payment not found');

      if (payment.status !== PaymentStatus.CAPTURED) {
        throw new ConflictException('Payment must be CAPTURED to refund');
      }

      if (amount > Number(payment.capturedAmount)) {
        throw new ConflictException('Refund amount exceeds captured amount');
      }

      // Create Refund
      const refundReference = 'REF-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      const refund = await tx.refund.create({
        data: {
          refundReference,
          paymentId,
          amount,
          reason,
          authorizedBy: userId
        }
      });

      // Update Payment status
      await tx.payment.update({
        where: { id: paymentId },
        data: { 
          status: PaymentStatus.REFUNDED
        }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          propertyId,
          userId,
          action: 'PROCESS_REFUND',
          entity: 'Refund',
          entityId: refund.id,
          after: JSON.stringify(refund),
          reason,
          timestamp: new Date()
        }
      });

      return refund;
    }, {
      isolationLevel: 'Serializable'
    });
  }
}
