import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service.js';

@Module({
  providers: [ReservationsService]
})
export class ReservationsModule {}
