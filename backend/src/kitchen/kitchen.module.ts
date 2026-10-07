import { Module } from '@nestjs/common';
import { KitchenService } from './kitchen.service.js';
import { KitchenController } from './kitchen.controller.js';

@Module({
  providers: [KitchenService],
  controllers: [KitchenController]
})
export class KitchenModule {}
