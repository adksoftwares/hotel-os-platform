import { Module } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service.js';

@Module({
  providers: [SuperAdminService]
})
export class SuperAdminModule {}
