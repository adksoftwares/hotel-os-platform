import { Module } from '@nestjs/common';
import { PosService } from './pos.service.js';
import { PosController } from './pos.controller.js';

@Module({
  providers: [PosService],
  controllers: [PosController]
})
export class PosModule {}
