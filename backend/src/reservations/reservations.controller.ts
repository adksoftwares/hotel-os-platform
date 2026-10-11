import { Body, Controller, ForbiddenException, Param, Post, Req } from '@nestjs/common';
import { ReservationsService } from './reservations.service.js';

@Controller('properties/:propertyId/reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  createReservation(
    @Req() req: any,
    @Param('propertyId') propertyId: string,
    @Body() body: {
      guestId: string;
      roomTypeId: string;
      roomId?: string;
      expectedCheckIn: string;
      expectedCheckOut: string;
      adults?: number;
      children?: number;
    }
  ) {
    if (req.user?.role !== 'SUPER_ADMIN' && req.user?.propertyId !== propertyId) {
      throw new ForbiddenException('You do not have access to this property');
    }
    if (!req.user?.id) {
      throw new ForbiddenException('A valid authenticated user is required');
    }

    return this.reservationsService.createReservation(
      propertyId,
      body.guestId,
      body.roomTypeId,
      new Date(body.expectedCheckIn),
      new Date(body.expectedCheckOut),
      body.roomId,
      body.adults ?? 1,
      body.children ?? 0,
      req.user.id
    );
  }
}
