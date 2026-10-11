import { Module } from '@nestjs/common';
import { PosService } from './pos.service.js';
import { PosController } from './pos.controller.js';
import { RealtimeModule } from '../realtime/realtime.module.js';

@Module({
  imports: [RealtimeModule],
  providers: [PosService],
  controllers: [PosController]
})
export class PosModule {}
