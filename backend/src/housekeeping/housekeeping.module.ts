import { Module } from '@nestjs/common';
import { HousekeepingService } from './housekeeping.service.js';

@Module({
  providers: [HousekeepingService]
})
export class HousekeepingModule {}
