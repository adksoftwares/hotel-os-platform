import { Body, Controller, ForbiddenException, Param, Post, Req } from '@nestjs/common';
import { StaysService } from './stays.service.js';

@Controller('properties/:propertyId/stays')
export class StaysController {
  constructor(private readonly staysService: StaysService) {}

  @Post('reservations/:reservationId/check-in')
  checkIn(
    @Req() req: any,
    @Param('propertyId') propertyId: string,
    @Param('reservationId') reservationId: string,
    @Body('roomId') roomId: string
  ) {
    if (req.user?.role !== 'SUPER_ADMIN' && req.user?.propertyId !== propertyId) {
      throw new ForbiddenException('You do not have access to this property');
    }
    if (!req.user?.id) {
      throw new ForbiddenException('A valid authenticated user is required');
    }
    return this.staysService.checkIn(propertyId, reservationId, roomId, req.user.id);
  }

  @Post(':stayId/check-out')
  checkOut(
    @Req() req: any,
    @Param('propertyId') propertyId: string,
    @Param('stayId') stayId: string
  ) {
    if (req.user?.role !== 'SUPER_ADMIN' && req.user?.propertyId !== propertyId) {
      throw new ForbiddenException('You do not have access to this property');
    }
    if (!req.user?.id) {
      throw new ForbiddenException('A valid authenticated user is required');
    }
    return this.staysService.checkOut(propertyId, stayId, req.user.id);
  }
}
