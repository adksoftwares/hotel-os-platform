import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(propertyId: string) {
    // Rooms & Housekeeping
    const totalRooms = await this.prisma.room.count({ where: { propertyId } });
    const occupiedRooms = await this.prisma.room.count({ where: { propertyId, occupancyStatus: 'OCCUPIED' } });
    const vacantRooms = await this.prisma.room.count({ where: { propertyId, occupancyStatus: 'VACANT' } });
    const reservedRooms = await this.prisma.room.count({ where: { propertyId, occupancyStatus: 'RESERVED' } });
    
    const dirtyRooms = await this.prisma.room.count({ where: { propertyId, housekeepingStatus: 'DIRTY' } });
    const cleaningRooms = await this.prisma.room.count({ where: { propertyId, housekeepingStatus: 'CLEANING' } });
    const readyRooms = await this.prisma.room.count({ where: { propertyId, housekeepingStatus: 'READY' } });
    const maintenanceRooms = await this.prisma.room.count({ where: { propertyId, operationalStatus: { in: ['MAINTENANCE', 'OUT_OF_SERVICE'] } } });
    const inspectionRooms = await this.prisma.room.count({ where: { propertyId, housekeepingStatus: 'INSPECTED' } });

    // Today Dates
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Reservations (Arrivals / Departures)
    const todayArrivals = await this.prisma.reservation.count({
      where: {
        propertyId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        expectedCheckIn: { gte: todayStart, lte: todayEnd }
      }
    });

    const todayDepartures = await this.prisma.reservation.count({
      where: {
        propertyId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        expectedCheckOut: { gte: todayStart, lte: todayEnd }
      }
    });

    const inHouseGuests = occupiedRooms;

    // Restaurant
    const activeOrders = await this.prisma.restaurantOrder.count({
      where: {
        propertyId,
        status: { notIn: ['COMPLETED', 'CANCELLED', 'SERVED'] }
      }
    });

    const activeKots = await this.prisma.kOT.count({
      where: {
        order: { propertyId },
        status: { in: ['PENDING', 'PREPARING'] }
      }
    });
    
    const preparingKots = await this.prisma.kOT.count({
      where: {
        order: { propertyId },
        status: 'PREPARING'
      }
    });

    const readyKots = await this.prisma.kOT.count({
      where: {
        order: { propertyId },
        status: 'READY'
      }
    });

    const delayedKots = 0;

    const occupiedTables = await this.prisma.restaurantTable.count({
      where: { propertyId, status: 'OCCUPIED' }
    });

    // Financial
    const financialAggregate = await this.prisma.folio.aggregate({
      _sum: {
        grandTotal: true,
        paidTotal: true,
        balance: true
      },
      where: {
        propertyId,
        openedAt: { gte: todayStart, lte: todayEnd }
      }
    });

    const todayRevenue = Number(financialAggregate._sum.grandTotal || 0);
    const todayPayments = Number(financialAggregate._sum.paidTotal || 0);
    const outstanding = Number(financialAggregate._sum.balance || 0);

    return {
      hotel: {
        totalRooms,
        occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
        occupiedRooms,
        vacantRooms,
        reservedRooms,
        todayArrivals,
        todayDepartures,
        inHouseGuests
      },
      housekeeping: {
        dirtyRooms,
        cleaningRooms,
        readyRooms,
        maintenanceRooms,
        inspectionRooms
      },
      restaurant: {
        activeOrders,
        activeKots,
        preparingKots,
        readyKots,
        occupiedTables,
        delayedKots
      },
      financial: {
        todayRevenue,
        todayPayments,
        outstanding
      }
    };
  }
}
