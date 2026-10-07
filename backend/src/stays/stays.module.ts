import { Module } from '@nestjs/common';
import { StaysService } from './stays.service.js';

@Module({
  providers: [StaysService]
})
export class StaysModule {}
