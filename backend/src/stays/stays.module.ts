import { Module } from '@nestjs/common';
import { StaysService } from './stays.service.js';
import { StaysController } from './stays.controller.js';

@Module({
  providers: [StaysService],
  controllers: [StaysController]
})
export class StaysModule {}
