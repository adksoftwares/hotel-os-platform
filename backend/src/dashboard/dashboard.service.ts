import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(propertyId: string) {
    // Rooms & Housekeeping
    const rooms = await this.prisma.room.findMany({ where: { propertyId } });
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r: any) => r.occupancyStatus === 'OCCUPIED').length;
    const vacantRooms = rooms.filter((r: any) => r.occupancyStatus === 'VACANT').length;
    const reservedRooms = rooms.filter((r: any) => r.occupancyStatus === 'RESERVED').length;
    
    const dirtyRooms = rooms.filter((r: any) => r.housekeepingStatus === 'DIRTY').length;
    const cleaningRooms = rooms.filter((r: any) => r.housekeepingStatus === 'CLEANING').length;
    const readyRooms = rooms.filter((r: any) => r.housekeepingStatus === 'READY').length;
    const maintenanceRooms = rooms.filter((r: any) => r.operationalStatus === 'MAINTENANCE' || r.operationalStatus === 'OUT_OF_SERVICE').length;
    const inspectionRooms = rooms.filter((r: any) => r.housekeepingStatus === 'INSPECTED').length; // Or 'INSPECTION_REQUIRED'

    // Today Dates
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Reservations (Arrivals / Departures)
    const reservations = await this.prisma.reservation.findMany({
      where: { propertyId }
    });
    
    const todayArrivals = reservations.filter((r: any) => {
      if (r.status === 'CANCELLED' || r.status === 'NO_SHOW') return false;
      const arr = new Date(r.expectedCheckIn);
      return arr >= todayStart && arr <= todayEnd;
    }).length;

    const todayDepartures = reservations.filter((r: any) => {
      if (r.status === 'CANCELLED' || r.status === 'NO_SHOW') return false;
      const dep = new Date(r.expectedCheckOut);
      return dep >= todayStart && dep <= todayEnd;
    }).length;

    const inHouseGuests = occupiedRooms; // Simplified for now, should count actual distinct guests if we had them connected

    // Restaurant
    const orders = await this.prisma.restaurantOrder.findMany({ where: { propertyId } });
    const activeOrders = orders.filter((o: any) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && o.status !== 'SERVED').length;

    const kots = await this.prisma.kOT.findMany({ where: { order: { propertyId } } });
    const activeKots = kots.filter((k: any) => k.status === 'NEW' || k.status === 'PENDING' || k.status === 'PREPARING').length;
    const preparingKots = kots.filter((k: any) => k.status === 'PREPARING').length;
    const readyKots = kots.filter((k: any) => k.status === 'READY').length;
    const delayedKots = 0; // Requires time diff logic

    const tables = await this.prisma.restaurantTable.findMany({ where: { propertyId } });
    const occupiedTables = tables.filter((t: any) => t.status === 'OCCUPIED').length;

    // Financial
    const folios = await this.prisma.folio.findMany({ 
      where: { 
        propertyId, 
        openedAt: { gte: todayStart, lte: todayEnd } 
      } 
    });
    const todayRevenue = folios.reduce((acc: any, f: any) => acc + Number(f.grandTotal), 0);
    const todayPayments = folios.reduce((acc: any, f: any) => acc + Number(f.paidTotal), 0);
    const outstanding = folios.reduce((acc: any, f: any) => acc + Number(f.balance), 0);

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
