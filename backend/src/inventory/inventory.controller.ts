import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('stocktake')
  async recordStocktake(
    @Req() req: any,
    @Body() body: {
      propertyId: string;
      locationId: string;
      inventoryItemId: string;
      actualQuantity: number;
      reason: string;
    }
  ) {
    const userId = req.user?.id || 'system';
    return this.inventoryService.recordStocktake(
      body.propertyId,
      body.locationId,
      body.inventoryItemId,
      body.actualQuantity,
      body.reason,
      userId
    );
  }
}
