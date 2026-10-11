import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (e) {
      console.warn('⚠️ Prisma could not reach database at localhost:5432 on startup. Retrying in background...');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
