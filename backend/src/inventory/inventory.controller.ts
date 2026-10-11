import { Controller, Post, Body, Req, UseGuards, ForbiddenException } from '@nestjs/common';
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
      propertyId?: string;
      locationId: string;
      inventoryItemId: string;
      actualQuantity: number;
      reason: string;
    }
  ) {
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    const authenticatedPropertyId = req.user?.propertyId as string | undefined;
    const propertyId = isSuperAdmin ? body.propertyId : authenticatedPropertyId;

    if (!propertyId || (!isSuperAdmin && body.propertyId && body.propertyId !== authenticatedPropertyId)) {
      throw new ForbiddenException('You do not have access to this property');
    }

    if (!req.user?.id) {
      throw new ForbiddenException('A valid authenticated user is required');
    }

    return this.inventoryService.recordStocktake(
      propertyId,
      body.locationId,
      body.inventoryItemId,
      body.actualQuantity,
      body.reason,
      req.user.id
    );
  }
}
