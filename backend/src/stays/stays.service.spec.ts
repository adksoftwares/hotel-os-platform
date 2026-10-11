import { Test, TestingModule } from '@nestjs/testing';
import { StaysService } from './stays.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('StaysService', () => {
  let service: StaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaysService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<StaysService>(StaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
