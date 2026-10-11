import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RoomHousekeepingStatus, RoomOperationalStatus } from '@prisma/client';

@Injectable()
export class RoomsService {
  async createRoom(propertyId: string, data: any) {
    const roomType = await this.prisma.roomType.findUnique({ where: { id: data.roomTypeId } });
    if (!roomType || roomType.propertyId !== propertyId) {
      throw new BadRequestException('Invalid room type for this property');
    }
    return this.prisma.room.create({
      data: {
        ...data,
        propertyId
      }
    });
  }

  constructor(private prisma: PrismaService) {}

  async getRooms(propertyId: string) {
    return this.prisma.room.findMany({
      where: { propertyId },
      include: { roomType: true, floor: true }
    });
  }

  async updateHousekeepingStatus(propertyId: string, roomId: string, status: RoomHousekeepingStatus) {
    const room = await this.prisma.room.findFirst({ where: { id: roomId, propertyId } });
    if (!room) throw new NotFoundException('Room not found');

    const allowedTransitions: Record<RoomHousekeepingStatus, RoomHousekeepingStatus[]> = {
      DIRTY: ['CLEANING', 'CLEAN'],
      CLEANING: ['CLEAN', 'DIRTY'],
      CLEAN: ['INSPECTED', 'READY', 'DIRTY'],
      INSPECTED: ['READY', 'DIRTY'],
      READY: ['DIRTY']
    };

    if (!allowedTransitions[room.housekeepingStatus].includes(status)) {
      throw new BadRequestException(`Cannot transition housekeeping status from ${room.housekeepingStatus} to ${status}`);
    }

    return this.prisma.room.update({
      where: { id: roomId },
      data: { housekeepingStatus: status }
    });
  }

  async updateOperationalStatus(propertyId: string, roomId: string, status: RoomOperationalStatus) {
    const room = await this.prisma.room.findFirst({ where: { id: roomId, propertyId } });
    if (!room) throw new NotFoundException('Room not found');

    return this.prisma.room.update({
      where: { id: roomId },
      data: { operationalStatus: status }
    });
  }

  async getRoomTimeline(propertyId: string, roomId: string) {
    const room = await this.prisma.room.findFirst({ where: { id: roomId, propertyId } });
    if (!room) throw new NotFoundException('Room not found');

    const stays = await this.prisma.stay.findMany({ where: { propertyId, roomId } });
    const maintenance = await this.prisma.maintenanceIssue.findMany({ where: { propertyId, roomId } });
    const housekeeping = await this.prisma.housekeepingTask.findMany({ where: { roomId } });

    const timeline = [
      ...stays.map(s => ({
        type: 'STAY',
        id: s.id,
        timestamp: s.actualCheckInAt,
        details: s
      })),
      ...maintenance.map(m => ({
        type: 'MAINTENANCE',
        id: m.id,
        timestamp: m.createdAt,
        details: m
      })),
      ...housekeeping.map(h => ({
        type: 'HOUSEKEEPING',
        id: h.id,
        timestamp: h.createdAt,
        details: h
      }))
    ];

    return timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createMaintenanceIssue(propertyId: string, roomId: string, data: any) {
    const room = await this.prisma.room.findFirst({ where: { id: roomId, propertyId } });
    if (!room) throw new NotFoundException('Room not found');

    return this.prisma.maintenanceIssue.create({
      data: {
        propertyId,
        roomId,
        issue: data.issue,
        priority: data.priority || 'NORMAL',
        status: 'OPEN',
        createdBy: data.createdBy
      }
    });
  }

  async updateMaintenanceStatus(propertyId: string, roomId: string, issueId: string, newStatus: string) {
    const issue = await this.prisma.maintenanceIssue.findFirst({ where: { id: issueId, propertyId, roomId } });
    if (!issue) throw new NotFoundException('Maintenance issue not found');

    const allowedTransitions: Record<string, string[]> = {
      OPEN: ['ASSIGNED', 'CLOSED'],
      ASSIGNED: ['IN_PROGRESS', 'OPEN'],
      IN_PROGRESS: ['RESOLVED', 'OPEN'],
      RESOLVED: ['CLOSED', 'IN_PROGRESS'],
      CLOSED: ['OPEN']
    };

    const currentStatus = issue.status;
    if (allowedTransitions[currentStatus] && !allowedTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(`Cannot transition maintenance status from ${currentStatus} to ${newStatus}`);
    }

    return this.prisma.maintenanceIssue.update({
      where: { id: issueId },
      data: { status: newStatus }
    });
  }
}

