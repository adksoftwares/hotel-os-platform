import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as crypto from 'crypto';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async addChargeToFolio(propertyId: string, folioId: string, payload: { description: string, amount: number, sourceType: string, sourceId?: string }) {
    return this.prisma.$transaction(async (tx) => {
      const folio = await tx.folio.findFirst({ where: { id: folioId, propertyId } });
      if (!folio) throw new NotFoundException('Folio not found');
      if (folio.status === 'CLOSED' || folio.status === 'SETTLED') throw new BadRequestException('Cannot add charges to closed folios');

      const item = await tx.folioItem.create({
        data: {
          folioId: folio.id,
          description: payload.description,
          unitPrice: payload.amount,
          subtotal: payload.amount,
          total: payload.amount, // ignoring tax/discount for scaffolding
          sourceType: payload.sourceType,
          sourceId: payload.sourceId
        }
      });

      const updatedFolio = await tx.folio.update({
        where: { id: folio.id },
        data: {
          subtotal: { increment: payload.amount },
          grandTotal: { increment: payload.amount },
          balance: { increment: payload.amount }
        }
      });

      return { item, folio: updatedFolio };
    });
  }

  async processPayment(propertyId: string, folioId: string, amount: number, method: string) {
    return this.prisma.$transaction(async (tx) => {
      const folio = await tx.folio.findFirst({ where: { id: folioId, propertyId } });
      if (!folio) throw new NotFoundException('Folio not found');

      const paymentReference = `PAY-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

      const payment = await tx.payment.create({
        data: {
          propertyId,
          folioId,
          amount,
          method,
          paymentReference
        }
      });

      const updatedFolio = await tx.folio.update({
        where: { id: folioId },
        data: {
          paidTotal: { increment: amount },
          balance: { decrement: amount }
        }
      });

      // Auto-settle logic
      if (Number(updatedFolio.balance) <= 0 && updatedFolio.status === 'OPEN') {
        await tx.folio.update({
          where: { id: folioId },
          data: { status: 'SETTLED' }
        });
      } else if (Number(updatedFolio.paidTotal) > 0 && updatedFolio.status === 'OPEN') {
        await tx.folio.update({
          where: { id: folioId },
          data: { status: 'PARTIALLY_SETTLED' }
        });
      }

      return payment;
    });
  }
}
