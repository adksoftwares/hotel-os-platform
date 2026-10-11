import { Module } from '@nestjs/common';
import { OtaController } from './ota.controller.js';
import { IotController } from './iot.controller.js';

@Module({
  controllers: [OtaController, IotController],
})
export class IntegrationsModule {}
