import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ReservationStatus } from '@prisma/client';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async createReservation(
    propertyId: string,
    guestId: string,
    roomTypeId: string,
    expectedCheckIn: Date,
    expectedCheckOut: Date,
    roomId?: string,
    adults = 1,
    children = 0
  ) {
    if (
      !(expectedCheckIn instanceof Date) ||
      !(expectedCheckOut instanceof Date) ||
      Number.isNaN(expectedCheckIn.getTime()) ||
      Number.isNaN(expectedCheckOut.getTime()) ||
      expectedCheckOut <= expectedCheckIn
    ) {
      throw new BadRequestException('Check-out must be after a valid check-in date');
    }
    if (!Number.isInteger(adults) || adults < 1 || !Number.isInteger(children) || children < 0) {
      throw new BadRequestException('Guest counts are invalid');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Verify property & guest
      const guest = await tx.guest.findUnique({ where: { id: guestId, propertyId } });
      if (!guest) throw new NotFoundException('Guest not found');

      // 2. Lock & Check Room Type
      const roomType = await tx.roomType.findUnique({ where: { id: roomTypeId, propertyId } });
      if (!roomType) throw new NotFoundException('Room Type not found');

      // 3. If a specific room is requested, check overlapping reservations for this specific room
      if (roomId) {
        const room = await tx.room.findUnique({ where: { id: roomId, propertyId, roomTypeId } });
        if (!room) throw new NotFoundException('Specific room not found or does not belong to this room type');

        // Check overlaps
        const overlapping = await tx.reservation.findFirst({
          where: {
            propertyId,
            roomId,
            status: { notIn: ['CANCELLED', 'NO_SHOW', 'CHECKED_OUT'] },
            AND: [
              { expectedCheckIn: { lt: expectedCheckOut } },
              { expectedCheckOut: { gt: expectedCheckIn } }
            ]
          }
        });

        if (overlapping) {
          throw new ConflictException(`Room ${room.roomNumber} is already booked for these dates`);
        }
      } else {
        // 4. If only room type is requested, check if we have enough inventory for this room type
        // Total rooms of this type
        const totalRooms = await tx.room.count({
          where: { propertyId, roomTypeId, operationalStatus: 'AVAILABLE' }
        });

        // Overlapping reservations for this room type
        const overlappingCount = await tx.reservation.count({
          where: {
            propertyId,
            roomTypeId,
            status: { notIn: ['CANCELLED', 'NO_SHOW', 'CHECKED_OUT'] },
            AND: [
              { expectedCheckIn: { lt: expectedCheckOut } },
              { expectedCheckOut: { gt: expectedCheckIn } }
            ]
          }
        });

        if (overlappingCount >= totalRooms) {
          throw new ConflictException(`No available rooms of type ${roomType.name} for these dates`);
        }
      }

      // 5. Create Reservation
      const reservation = await tx.reservation.create({
        data: {
          propertyId,
          guestId,
          roomTypeId,
          roomId,
          expectedCheckIn,
          expectedCheckOut,
          adults,
          children,
          status: ReservationStatus.CONFIRMED
        }
      });

      // 6. Audit Log
      await tx.auditLog.create({
        data: {
          propertyId,
          userId: 'SYSTEM', // Assuming system if no user provided, or pass userId
          action: 'CREATE_RESERVATION',
          entity: 'Reservation',
          entityId: reservation.id,
          after: JSON.stringify(reservation),
          reason: 'New booking via engine',
          timestamp: new Date()
        }
      });

      return reservation;
    }, {
      isolationLevel: 'Serializable' // Prevents phantom reads (double booking concurrency)
    });
  }
}
