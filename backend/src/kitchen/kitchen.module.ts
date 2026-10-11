import { Module } from '@nestjs/common';
import { KitchenService } from './kitchen.service.js';
import { KitchenController } from './kitchen.controller.js';
import { RealtimeModule } from '../realtime/realtime.module.js';

@Module({
  imports: [RealtimeModule],
  providers: [KitchenService],
  controllers: [KitchenController]
})
export class KitchenModule {}
