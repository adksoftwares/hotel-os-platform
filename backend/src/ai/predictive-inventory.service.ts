import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PredictiveInventoryService {
  private readonly logger = new Logger(PredictiveInventoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 2 * * *')
  async analyzeInventory() {
    this.logger.debug('Running Predictive Inventory analysis...');
    
    // Analyze consumption over the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const properties = await this.prisma.property.findMany();

    for (const property of properties) {
      const items = await this.prisma.inventoryItem.findMany({
        where: { propertyId: property.id },
        include: { balances: true }
      });

      for (const item of items) {
        // Calculate consumption from stock movements (assuming 'CONSUMPTION' or 'OUT' movement type represents usage)
        const movements = await this.prisma.stockMovement.aggregate({
          _sum: { quantity: true },
          where: {
            inventoryItemId: item.id,
            movementType: { in: ['CONSUMPTION', 'OUT', 'USAGE'] },
            createdAt: { gte: thirtyDaysAgo }
          }
        });

        const totalConsumed = Number(movements._sum.quantity || 0);
        const dailyConsumption = totalConsumed / 30;

        // E.g., Lead time is 7 days, we need at least 7 days of stock
        const requiredStock = dailyConsumption * 7;
        
        const currentStock = item.balances.reduce((sum, bal) => sum + Number(bal.quantity), 0);

        if (currentStock < requiredStock) {
          this.logger.warn(`Item ${item.name} (SKU: ${item.sku}) needs reordering. Current: ${currentStock}, Required: ${requiredStock}`);
          
          // Create notification for the property
          await this.prisma.notification.create({
            data: {
              propertyId: property.id,
              type: 'INVENTORY_ALERT',
              priority: 'HIGH',
              title: 'Predictive Reorder Alert',
              message: `AI Prediction: Item ${item.name} is running low based on past consumption. Current stock: ${currentStock}. Consider reordering soon.`,
              relatedResource: item.id
            }
          });
        }
      }
    }
  }
}
