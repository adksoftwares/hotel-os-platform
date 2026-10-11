import { Controller, Post, Body } from '@nestjs/common';
import { PosService } from './pos.service.js';
import { AuthUser } from '../auth/decorators/auth-user.decorator.js';

@Controller('pos')
export class PosController {
  constructor(private posService: PosService) {}

  @Post('add-items')
  async addItems(@AuthUser() user: any, @Body() body: any) {
    return this.posService.addItemsToOrder(user.propertyId, body.orderId, body.items, body.roomId);
  }
}
