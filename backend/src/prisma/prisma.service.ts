import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err: any) {
      console.warn('[PrismaService] Database connection failed on startup. Running in offline/unconnected mode:', err?.message || err);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
