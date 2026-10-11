import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class YieldService {
  private readonly logger = new Logger(YieldService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 1 * * *')
  async calculateFutureOccupancy() {
    this.logger.debug('Running AI Yield Management calculation...');
    
    // Get all properties
    const properties = await this.prisma.property.findMany();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    for (const property of properties) {
      // Find room types
      const roomTypes = await this.prisma.roomType.findMany({
        where: { propertyId: property.id },
        include: { rooms: true }
      });

      for (const roomType of roomTypes) {
        const totalRooms = roomType.rooms.length;
        if (totalRooms === 0) continue;

        // Find overlapping reservations for tomorrow
        const reservations = await this.prisma.reservation.count({
          where: {
            roomTypeId: roomType.id,
            status: { in: ['CONFIRMED', 'CHECKED_IN'] },
            expectedCheckIn: { lt: dayAfterTomorrow },
            expectedCheckOut: { gt: tomorrow }
          }
        });

        const occupancy = reservations / totalRooms;
        this.logger.debug(`Property ${property.id} RoomType ${roomType.id} Occupancy: ${occupancy * 100}%`);

        if (occupancy > 0.8) {
          // Increase room rates dynamically by 10%
          const newPrice = Number(roomType.basePrice) * 1.1;
          await this.prisma.roomType.update({
            where: { id: roomType.id },
            data: { basePrice: newPrice }
          });
          this.logger.log(`Yield Management: Increased rate for RoomType ${roomType.id} to ${newPrice}`);
        }
      }
    }
  }
}
