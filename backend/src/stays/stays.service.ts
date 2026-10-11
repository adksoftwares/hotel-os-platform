import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as crypto from 'crypto';

@Injectable()
export class StaysService {
  constructor(private prisma: PrismaService) {}

  async checkIn(propertyId: string, reservationId: string, roomId: string, staffId: string) {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findFirst({
        where: { id: reservationId, propertyId },
        include: { guest: true }
      });
      if (!reservation) throw new NotFoundException('Reservation not found');
      if (reservation.status !== 'CONFIRMED') {
        throw new ConflictException('Reservation must be CONFIRMED to check-in');
      }

      const room = await tx.room.findFirst({ where: { id: roomId, propertyId } });
      if (!room) throw new NotFoundException('Room not found');
      if (room.roomTypeId !== reservation.roomTypeId || (reservation.roomId && reservation.roomId !== roomId)) {
        throw new BadRequestException('The room does not match this reservation');
      }

      // Claim both resources conditionally inside the transaction. This prevents
      // two concurrent requests from checking in guests to the same room or
      // consuming the same reservation.
      const claimedRoom = await tx.room.updateMany({
        where: {
          id: roomId,
          propertyId,
          occupancyStatus: 'VACANT',
          operationalStatus: 'AVAILABLE',
          housekeepingStatus: 'CLEAN'
        },
        data: { occupancyStatus: 'OCCUPIED' }
      });
      if (claimedRoom.count !== 1) {
        throw new ConflictException('Room is no longer available for check-in');
      }

      const claimedReservation = await tx.reservation.updateMany({
        where: { id: reservationId, propertyId, status: 'CONFIRMED' },
        data: { status: 'CHECKED_IN' }
      });
      if (claimedReservation.count !== 1) {
        throw new ConflictException('Reservation has already been checked in or changed');
      }

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

      await tx.stayRoomAssignment.create({
        data: { stayId: stay.id, roomId: room.id }
      });

      await tx.folio.update({
        where: { id: folio.id, propertyId },
        data: { stayId: stay.id }
      });

      await tx.auditLog.create({
        data: {
          propertyId,
          action: 'GUEST_CHECK_IN',
          entity: 'Stay',
          entityId: stay.id,
          userId: staffId,
          metadata: { roomId, folioNumber }
        }
      });

      return stay;
    }, {
      isolationLevel: 'Serializable'
    });
  }

  async checkOut(propertyId: string, stayId: string, staffId: string) {
    return this.prisma.$transaction(async (tx) => {
      const stay = await tx.stay.findFirst({
        where: { id: stayId, propertyId },
        include: { folio: true }
      });
      if (!stay) throw new NotFoundException('Stay not found');
      if (stay.status !== 'ACTIVE') throw new ConflictException('Stay is not active');
      if (Number(stay.folio.balance) > 0) {
        throw new BadRequestException('Folio has outstanding balance. Please settle before checkout.');
      }

      const completed = await tx.stay.updateMany({
        where: { id: stayId, propertyId, status: 'ACTIVE' },
        data: { status: 'COMPLETED', actualCheckOutAt: new Date() }
      });
      if (completed.count !== 1) {
        throw new ConflictException('Stay has already been checked out or changed');
      }

      await tx.room.updateMany({
        where: { id: stay.roomId, propertyId, occupancyStatus: 'OCCUPIED' },
        data: { occupancyStatus: 'VACANT', housekeepingStatus: 'DIRTY' }
      });

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

      await tx.auditLog.create({
        data: {
          propertyId,
          action: 'GUEST_CHECK_OUT',
          entity: 'Stay',
          entityId: stayId,
          userId: staffId,
          metadata: { roomId: stay.roomId }
        }
      });

      return tx.stay.findUnique({ where: { id: stayId, propertyId } });
    }, {
      isolationLevel: 'Serializable'
    });
  }
}
