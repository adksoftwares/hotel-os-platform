import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import * as crypto from 'crypto';

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
    if (!Number.isFinite(amount) || amount <= 0 || !idempotencyKey?.trim()) {
      throw new BadRequestException('A positive payment amount and idempotency key are required');
    }
    const paymentAmount = new Prisma.Decimal(amount);

    // Idempotency keys are global-unique in the schema. Never return a payment
    // from another tenant when a caller reuses a key.
    const existingPayment = await this.prisma.payment.findUnique({
      where: { idempotencyKey }
    });
    if (existingPayment) {
      const sameRequest =
        existingPayment.propertyId === propertyId &&
        existingPayment.folioId === folioId &&
        existingPayment.amount.equals(paymentAmount) &&
        existingPayment.method === method;
      if (!sameRequest) {
        throw new ConflictException('Idempotency key has already been used for a different payment');
      }
      return existingPayment;
    }

    return this.prisma.$transaction(async (tx) => {
      const folio = await tx.folio.findUnique({ where: { id: folioId, propertyId } });
      if (!folio) throw new NotFoundException('Folio not found');
      if (folio.status === 'CLOSED') throw new ConflictException('Cannot pay a closed folio');
      if (paymentAmount.gt(folio.balance)) {
        throw new ConflictException('Payment amount exceeds the outstanding folio balance');
      }

      const payment = await tx.payment.create({
        data: {
          propertyId,
          folioId,
          amount: paymentAmount,
          capturedAmount: paymentAmount,
          method,
          status: PaymentStatus.CAPTURED,
          paymentReference,
          idempotencyKey
        }
      });

      const balanceAfter = folio.balance.sub(paymentAmount);
      const paidAfter = folio.paidTotal.add(paymentAmount);
      await tx.folio.update({
        where: { id: folioId, propertyId },
        data: {
          paidTotal: paidAfter,
          balance: balanceAfter,
          status: balanceAfter.lte(0) ? 'SETTLED' : 'PARTIALLY_SETTLED'
        }
      });

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
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Refund amount must be greater than zero');
    }
    const refundAmount = new Prisma.Decimal(amount);

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId, propertyId }
      });
      if (!payment) throw new NotFoundException('Payment not found');
      if (payment.status !== PaymentStatus.CAPTURED) {
        throw new ConflictException('Payment must be CAPTURED to refund');
      }

      const previousRefunds = await tx.refund.aggregate({
        where: { paymentId },
        _sum: { amount: true }
      });
      const alreadyRefunded = previousRefunds._sum.amount ?? new Prisma.Decimal(0);
      const totalRefunded = alreadyRefunded.add(refundAmount);
      if (totalRefunded.gt(payment.capturedAmount)) {
        throw new ConflictException('Cumulative refunds cannot exceed the captured amount');
      }

      const folio = await tx.folio.findUnique({
        where: { id: payment.folioId, propertyId }
      });
      if (!folio) throw new NotFoundException('Folio not found');

      const refund = await tx.refund.create({
        data: {
          refundReference: `REF-${crypto.randomUUID()}`,
          paymentId,
          amount: refundAmount,
          reason,
          authorizedBy: userId
        }
      });

      const fullyRefunded = totalRefunded.gte(payment.capturedAmount);
      if (fullyRefunded) {
        await tx.payment.update({
          where: { id: paymentId, propertyId },
          data: { status: PaymentStatus.REFUNDED }
        });
      }

      const paidAfter = Prisma.Decimal.max(
        new Prisma.Decimal(0),
        folio.paidTotal.sub(refundAmount)
      );
      const balanceAfter = folio.balance.add(refundAmount);
      await tx.folio.update({
        where: { id: folio.id, propertyId },
        data: {
          paidTotal: paidAfter,
          balance: balanceAfter,
          status: paidAfter.lte(0)
            ? 'OPEN'
            : balanceAfter.lte(0)
              ? 'SETTLED'
              : 'PARTIALLY_SETTLED'
        }
      });

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
