import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PosService {
  constructor(private prisma: PrismaService) {}

  async addItemsToOrder(
    propertyId: string,
    orderId: string,
    items: {
      menuItemId: string;
      quantity: number;
      discountAmount?: number;
      discountType?: string;
      discountReason?: string;
      notes?: string;
    }[]
  ) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.restaurantOrder.findFirst({
        where: { id: orderId, propertyId },
        include: { items: true }
      });
      if (!order) throw new NotFoundException('Order not found');

      let newSubtotal = 0;
      let newDiscountTotal = 0;
      const kotsToCreate: Record<string, any[]> = {}; // Group by kitchenStationId

      // 1. Process New Items
      for (const item of items) {
        const menuItem = await tx.menuItem.findUnique({ where: { id: item.menuItemId } });
        if (!menuItem) throw new NotFoundException(`Menu item ${item.menuItemId} not found`);

        const unitPrice = Number(menuItem.price);
        const itemSubtotal = unitPrice * item.quantity;
        const discountAmount = item.discountAmount || 0;
        const itemTotal = itemSubtotal - discountAmount;

        const orderItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            menuItemId: menuItem.id,
            quantity: item.quantity,
            unitPrice: unitPrice,
            discountAmount: discountAmount,
            discountType: item.discountType,
            discountReason: item.discountReason,
            subtotal: itemSubtotal,
            total: itemTotal,
            notes: item.notes,
            itemNameSnapshot: menuItem.name,
            status: 'NEW'
          }
        });

        newSubtotal += itemSubtotal;
        newDiscountTotal += discountAmount;

        // Group into KOT by Station
        if (menuItem.kitchenStationId) {
          if (!kotsToCreate[menuItem.kitchenStationId]) {
            kotsToCreate[menuItem.kitchenStationId] = [];
          }
          kotsToCreate[menuItem.kitchenStationId].push(orderItem.id);
        }
      }

      // 2. Generate KOTs natively per station
      for (const [stationId, orderItemIds] of Object.entries(kotsToCreate)) {
        const kot = await tx.kOT.create({
          data: {
            orderId: order.id,
            kitchenStationId: stationId,
            status: 'PENDING'
          }
        });

        // Link KOT to items
        await tx.orderItem.updateMany({
          where: { id: { in: orderItemIds } },
          data: { kotId: kot.id, status: 'PREPARING' }
        });
      }

      // 3. Update Financials (Assume flat 10% tax for calculation simplicity)
      const taxRate = 0.10;
      // Tax applies to the amount after discount
      const taxableAmount = newSubtotal - newDiscountTotal;
      const totalTax = taxableAmount > 0 ? taxableAmount * taxRate : 0;
      
      const updatedOrder = await tx.restaurantOrder.update({
        where: { id: order.id },
        data: {
          subtotal: { increment: newSubtotal },
          discountTotal: { increment: newDiscountTotal },
          tax: { increment: totalTax },
          grandTotal: { increment: (taxableAmount + totalTax) }
        },
        include: { items: true, kots: true }
      });

      return updatedOrder;
    });
  }
}
