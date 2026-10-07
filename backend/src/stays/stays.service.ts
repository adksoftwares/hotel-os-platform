import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as crypto from 'crypto';

@Injectable()
export class StaysService {
  constructor(private prisma: PrismaService) {}

  async checkIn(propertyId: string, reservationId: string, roomId: string, staffId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Validate Reservation
      const reservation = await tx.reservation.findFirst({
        where: { id: reservationId, propertyId },
        include: { guest: true }
      });
      if (!reservation) throw new NotFoundException('Reservation not found');
      if (reservation.status !== 'CONFIRMED') throw new BadRequestException('Reservation must be CONFIRMED to check-in');

      // 2. Validate Room
      const room = await tx.room.findFirst({ where: { id: roomId, propertyId } });
      if (!room) throw new NotFoundException('Room not found');
      if (room.occupancyStatus !== 'VACANT') throw new BadRequestException('Room is not VACANT');
      if (room.operationalStatus !== 'AVAILABLE') throw new BadRequestException('Room is not AVAILABLE');
      if (room.housekeepingStatus !== 'CLEAN') throw new BadRequestException('Room must be CLEAN for check-in');

      // 3. Create Folio
      const folioNumber = `FOL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const folio = await tx.folio.create({
        data: {
          propertyId,
          folioNumber,
          guestId: reservation.guestId,
          currency: 'USD',
          status: 'OPEN'
        }
      });

      // 4. Create Stay
      const stay = await tx.stay.create({
        data: {
          propertyId,
          reservationId,
          guestId: reservation.guestId,
          roomId,
          folioId: folio.id,
          status: 'ACTIVE',
          actualCheckInAt: new Date()
        }
      });

      // 5. Assign Room History
      await tx.stayRoomAssignment.create({
        data: { stayId: stay.id, roomId: room.id }
      });

      // 6. Update Folio with Inverse Relation
      await tx.folio.update({
        where: { id: folio.id },
        data: { stayId: stay.id }
      });

      // 7. Update Reservation & Room Status
      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: 'CHECKED_IN' }
      });
      await tx.room.update({
        where: { id: roomId },
        data: { occupancyStatus: 'OCCUPIED' }
      });

      // 8. Audit Log
      await tx.auditLog.create({
        data: {
          action: 'GUEST_CHECK_IN',
          entity: 'Stay',
          entityId: stay.id,
          userId: staffId,
          metadata: { roomId, folioNumber }
        }
      });

      return stay;
    });
  }

  async checkOut(propertyId: string, stayId: string, staffId: string) {
    return this.prisma.$transaction(async (tx) => {
      const stay = await tx.stay.findFirst({
        where: { id: stayId, propertyId },
        include: { folio: true }
      });
      if (!stay) throw new NotFoundException('Stay not found');
      if (stay.status !== 'ACTIVE') throw new BadRequestException('Stay is not active');
      if (Number(stay.folio.balance) > 0) throw new BadRequestException('Folio has outstanding balance. Please settle before checkout.');

      // Complete stay
      const completedStay = await tx.stay.update({
        where: { id: stayId },
        data: { status: 'COMPLETED', actualCheckOutAt: new Date() }
      });

      // Update room to vacant/dirty
      await tx.room.update({
        where: { id: stay.roomId },
        data: { occupancyStatus: 'VACANT', housekeepingStatus: 'DIRTY' }
      });
      
      // Auto-trigger housekeeping cleaning task
      await tx.housekeepingTask.create({
        data: {
          roomId: stay.roomId,
          taskType: 'CLEANING',
          status: 'PENDING',
          priority: 'HIGH',
          notes: 'Checkout cleaning required',
          workflowStatus: 'TO_DO'
        }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          action: 'GUEST_CHECK_OUT',
          entity: 'Stay',
          entityId: stayId,
          userId: staffId,
          metadata: { roomId: stay.roomId }
        }
      });

      return completedStay;
    });
  }
}
