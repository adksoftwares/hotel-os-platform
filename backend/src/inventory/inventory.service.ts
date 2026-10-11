import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as crypto from 'crypto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async receiveGoods(propertyId: string, locationId: string, items: { inventoryItemId: string, quantity: number, unitCost: number }[]) {
    return this.prisma.$transaction(async (tx) => {
      const receiptNumber = `GRN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      
      const receipt = await tx.goodsReceipt.create({
        data: {
          propertyId,
          receiptNumber,
          items: {
            create: items.map(i => ({
              inventoryItemId: i.inventoryItemId,
              locationId,
              quantity: i.quantity,
              unitCost: i.unitCost
            }))
          }
        }
      });

      // Update Stock Balances and Create Movements
      for (const item of items) {
        // Stock Movement (Audit trail)
        await tx.stockMovement.create({
          data: {
            propertyId,
            locationId,
            inventoryItemId: item.inventoryItemId,
            movementType: 'PURCHASE_RECEIPT',
            quantity: item.quantity,
            referenceType: 'GOODS_RECEIPT',
            referenceId: receipt.id
          }
        });

        // Upsert Balance
        await tx.stockBalance.upsert({
          where: {
            locationId_inventoryItemId: {
              locationId,
              inventoryItemId: item.inventoryItemId
            },
            propertyId
          },
          update: {
            quantity: { increment: item.quantity }
          },
          create: {
            propertyId,
            locationId,
            inventoryItemId: item.inventoryItemId,
            quantity: item.quantity
          }
        });
      }

      return receipt;
    });
  }

  async recordStocktake(
    propertyId: string,
    locationId: string,
    inventoryItemId: string,
    actualQuantity: number,
    reason: string,
    userId: string
  ) {
    return this.prisma.$transaction(async (tx) => {
      const currentStock = await tx.stockBalance.findUnique({
        where: {
          locationId_inventoryItemId: { locationId, inventoryItemId },
          propertyId
        }
      });
      const currentQty = currentStock ? Number(currentStock.quantity) : 0;
      const variance = actualQuantity - currentQty;

      if (variance !== 0) {
        await tx.stockMovement.create({
          data: {
            propertyId,
            locationId,
            inventoryItemId,
            movementType: 'ADJUSTMENT',
            quantity: variance,
            referenceType: 'STOCKTAKE',
            referenceId: reason || userId
          }
        });

        await tx.stockBalance.upsert({
          where: {
            locationId_inventoryItemId: { locationId, inventoryItemId },
            propertyId
          },
          update: { quantity: actualQuantity },
          create: {
            propertyId,
            locationId,
            inventoryItemId,
            quantity: actualQuantity
          }
        });
      }

      return { inventoryItemId, actualQuantity, variance };
    });
  }
}


