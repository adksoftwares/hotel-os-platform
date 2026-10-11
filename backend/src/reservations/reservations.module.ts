import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service.js';
import { ReservationsController } from './reservations.controller.js';

@Module({
  providers: [ReservationsService],
  controllers: [ReservationsController]
})
export class ReservationsModule {}
