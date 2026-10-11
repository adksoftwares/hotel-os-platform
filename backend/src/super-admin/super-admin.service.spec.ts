import { Test, TestingModule } from '@nestjs/testing';
import { SuperAdminService } from './super-admin.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('SuperAdminService', () => {
  let service: SuperAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperAdminService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<SuperAdminService>(SuperAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
