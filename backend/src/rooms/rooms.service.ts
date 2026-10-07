import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async getRooms(propertyId: string) {
    return this.prisma.room.findMany({
      where: { propertyId },
      include: { roomType: true, floor: true }
    });
  }

  async updateHousekeepingStatus(propertyId: string, roomId: string, status: string) {
    const room = await this.prisma.room.findFirst({ where: { id: roomId, propertyId } });
    if (!room) throw new NotFoundException('Room not found');

    return this.prisma.room.update({
      where: { id: roomId },
      data: { housekeepingStatus: status }
    });
  }

  async updateOperationalStatus(propertyId: string, roomId: string, status: string) {
    const room = await this.prisma.room.findFirst({ where: { id: roomId, propertyId } });
    if (!room) throw new NotFoundException('Room not found');

    return this.prisma.room.update({
      where: { id: roomId },
      data: { operationalStatus: status }
    });
  }
}
