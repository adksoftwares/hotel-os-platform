import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { WebsocketGateway } from '../realtime/websocket/realtime/websocket.gateway.js';
import { KOTStatus, RestaurantOrderStatus } from '@prisma/client';

@Injectable()
export class PosService {
  constructor(private prisma: PrismaService, private wsGateway: WebsocketGateway) {}

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
    }[],
    roomId?: string
  ) {
    return this.prisma.$transaction(async (tx) => {
      if (roomId) {
        const activeStay = await tx.stay.findFirst({
          where: { roomId, propertyId, status: 'ACTIVE' }
        });
        if (!activeStay) {
          throw new BadRequestException('Room is vacant');
        }
      }

      const order = await tx.restaurantOrder.findUnique({
        where: { id: orderId, propertyId },
        include: { items: true }
      });
      if (!order) throw new NotFoundException('Order not found');
      
      if (order.tableId) {
        const table = await tx.restaurantTable.findUnique({ where: { id: order.tableId } });
        if (!table || table.propertyId !== propertyId) {
          throw new BadRequestException('Invalid table for this property');
        }
      }
      if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
        throw new BadRequestException('Cannot add items to completed or cancelled orders');
      }

      let newSubtotal = 0;
      let newDiscountTotal = 0;
      const kotsToCreate: Record<string, any[]> = {}; // Group by kitchenStationId

      // 1. Process New Items & Deduct Inventory
      for (const item of items) {
        // Fetch menu item WITH recipe
        const menuItem = await tx.menuItem.findUnique({ 
          where: { id: item.menuItemId, propertyId },
          include: { recipeItems: true }
        });
        if (!menuItem) throw new NotFoundException(`Menu item ${item.menuItemId} not found`);

        const unitPrice = Number(menuItem.price);
        const itemSubtotal = unitPrice * item.quantity;
        const discountAmount = item.discountAmount || 0;

        // Challenge #23: Prevent Negative Discounts (Discount > Subtotal)
        if (discountAmount > itemSubtotal || discountAmount < 0) {
          throw new BadRequestException('Discount cannot be negative or exceed the subtotal');
        }

        if (discountAmount > 0 && itemSubtotal > 0) {
          const discountPercentage = (discountAmount / itemSubtotal) * 100;
          if (discountPercentage > 10) {
            throw new UnauthorizedException('Manager approval required');
          }
        }

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

        // Challenge #34: Inventory Deduction based on Recipe inside the same transaction
        if (menuItem.recipeItems && menuItem.recipeItems.length > 0) {
          for (const recipe of menuItem.recipeItems) {
            const consumptionQty = Number(recipe.quantity) * item.quantity;

            const currentStock = await tx.stockBalance.findFirst({
              where: { 
                propertyId, 
                inventoryItemId: recipe.inventoryItemId,
                locationId: 'MAIN_KITCHEN_LOCATION' // Hardcoded for structural demo
              }
            });

            if (!currentStock || Number(currentStock.quantity) < consumptionQty) {
              throw new BadRequestException('Insufficient ingredients');
            }

            // Log stock movement
            await tx.stockMovement.create({
              data: {
                propertyId,
                locationId: 'MAIN_KITCHEN_LOCATION', // In real app, this should be dynamically mapped
                inventoryItemId: recipe.inventoryItemId,
                movementType: 'CONSUMPTION',
                quantity: -consumptionQty,
                referenceType: 'RestaurantOrder',
                referenceId: order.id
              }
            });

            // Decrease StockBalance
            await tx.stockBalance.updateMany({
              where: { 
                propertyId, 
                inventoryItemId: recipe.inventoryItemId,
                locationId: 'MAIN_KITCHEN_LOCATION' // Hardcoded for structural demo
              },
              data: {
                quantity: { decrement: consumptionQty }
              }
            });
          }
        }

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
            propertyId,
            orderId: order.id,
            kitchenStationId: stationId,
            status: KOTStatus.PENDING
          }
        });

        // Link KOT to items
        await tx.orderItem.updateMany({
          where: { id: { in: orderItemIds } },
          data: { kotId: kot.id, status: 'PREPARING' } // Using string cast or correct enum mapping later
        });
      }

      // 3. Update Financials with Dynamic Tax Engine (Challenge #22)
      // Fetch active tax configuration for this property
      const taxes = await tx.taxConfig.findMany({
        where: { propertyId, isActive: true }
      });

      const taxableAmount = newSubtotal - newDiscountTotal;
      let totalTax = 0;

      // Simple cascading/additive tax simulation
      for (const tax of taxes) {
        if (!tax.isInclusive) {
          totalTax += (taxableAmount * Number(tax.rate)) / 100;
        }
      }
      
      const updatedOrder = await tx.restaurantOrder.update({
        where: { id: order.id, propertyId },
        data: {
          subtotal: { increment: newSubtotal },
          discountTotal: { increment: newDiscountTotal },
          tax: { increment: totalTax },
          grandTotal: { increment: (taxableAmount + totalTax) }
        },
        include: { items: true, kots: true }
      });

      this.wsGateway.broadcastToProperty(propertyId, 'KOT_CREATED', { orderId, kots: updatedOrder.kots });
      return updatedOrder;
    }, {
      isolationLevel: 'ReadCommitted' // Standard isolation
    });
  }
}

