import { Module } from '@nestjs/common';
import { YieldService } from './yield.service.js';
import { PredictiveInventoryService } from './predictive-inventory.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [YieldService, PredictiveInventoryService],
  exports: [YieldService, PredictiveInventoryService],
})
export class AiModule {}
