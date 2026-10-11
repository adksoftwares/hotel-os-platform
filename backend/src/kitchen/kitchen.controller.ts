import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { KitchenService } from './kitchen.service.js';
import { AuthUser } from '../auth/decorators/auth-user.decorator.js';

@Controller('kitchen')
export class KitchenController {
  constructor(private kitchenService: KitchenService) {}

  @Get('kots')
  async getKots(@AuthUser() user: any) {
    return this.kitchenService.getKots(user.propertyId);
  }

  @Post('kot/:id/status')
  async updateStatus(
    @AuthUser() user: any,
    @Param('id') id: string,
    @Body() body: any
  ) {
    return this.kitchenService.updateKotStatus(user.propertyId, id, body.status, user.id);
  }
}
