import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as crypto from 'crypto';

@Injectable()
export class SuperAdminService {
  constructor(private prisma: PrismaService) {}

  async createSupportSession(propertyId: string, initiatedById: string, reason: string, durationHours: number) {
    const sessionReference = `SUP-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + durationHours);

    return this.prisma.supportSession.create({
      data: {
        sessionReference,
        propertyId,
        initiatedById,
        reason,
        expiresAt,
        status: 'ACTIVE'
      }
    });
  }

  async terminateSession(propertyId: string, sessionId: string, terminatedById: string, terminationReason: string) {
    return this.prisma.supportSession.update({
      where: { id: sessionId, propertyId },
      data: {
        status: 'TERMINATED',
        terminatedAt: new Date(),
        terminatedById,
        terminationReason
      }
    });
  }
}

