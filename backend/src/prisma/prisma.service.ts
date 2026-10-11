import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Fail startup if the database is unavailable; serving requests without the
    // database can produce misleading success responses and unsafe partial work.
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
