import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { WebsocketGateway } from '../realtime/websocket/realtime/websocket.gateway.js';
import { KOTStatus } from '@prisma/client';

@Injectable()
export class KitchenService {
  constructor(
    private prisma: PrismaService,
    private wsGateway: WebsocketGateway
  ) {}

  async getKots(propertyId: string) {
    return this.prisma.kOT.findMany({
      where: {
        order: { propertyId },
        status: { not: 'SERVED' }
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateKotStatus(propertyId: string, kotId: string, status: KOTStatus, userId: string) {
    const kot = await this.prisma.kOT.findFirst({
      where: { 
        id: kotId,
        order: { propertyId } // Ensure it belongs to the property
      },
      include: { items: true }
    });
    
    if (!kot) throw new NotFoundException('KOT not found');

    const updatedKot = await this.prisma.kOT.update({
      where: { id: kotId },
      data: { status }
    });

    // Broadcast to KDS and POS
    this.wsGateway.broadcastToProperty(propertyId, 'KOT_UPDATED', {
      kotId: updatedKot.id,
      status: updatedKot.status,
      timestamp: new Date()
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        propertyId,
        userId,
        action: 'UPDATE_KOT_STATUS',
        entity: 'KOT',
        entityId: kotId,
        after: JSON.stringify({ status }),
        reason: 'Kitchen staff updated status',
        timestamp: new Date()
      }
    });

    return updatedKot;
  }
}
