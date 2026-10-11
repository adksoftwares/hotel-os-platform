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
import { HealthModule } from './health/health.module.js';
import { ScheduleModule } from '@nestjs/schedule';
import { AiModule } from './ai/ai.module.js';
import { IntegrationsModule } from './integrations/integrations.module.js';

import { ConfigModule } from '@nestjs/config';

import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';
import { RolesGuard } from './auth/guards/roles.guard.js';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    ScheduleModule.forRoot(), 
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 600 }]),
    AiModule, AuthModule, PrismaModule, RoomsModule, HousekeepingModule, ReservationsModule, StaysModule, PosModule, KitchenModule, BillingModule, InventoryModule, SuperAdminModule, AnalyticsModule, RealtimeModule, DashboardModule, HealthModule, IntegrationsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard }
  ],
})
export class AppModule {}

