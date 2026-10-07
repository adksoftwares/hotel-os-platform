import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RoomsModule } from './rooms/rooms.module.js';
import { HousekeepingModule } from './housekeeping/housekeeping.module.js';
import { ReservationsModule } from './reservations/reservations.module.js';
import { StaysModule } from './stays/stays.module.js';
import { PosModule } from './pos/pos.module.js';
import { KitchenModule } from './kitchen/kitchen.module.js';
import { BillingModule } from './billing/billing.module.js';
import { InventoryModule } from './inventory/inventory.module.js';
import { SuperAdminModule } from './super-admin/super-admin.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { RealtimeModule } from './realtime/realtime.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';

@Module({
  imports: [AuthModule, PrismaModule, RoomsModule, HousekeepingModule, ReservationsModule, StaysModule, PosModule, KitchenModule, BillingModule, InventoryModule, SuperAdminModule, AnalyticsModule, RealtimeModule, DashboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
