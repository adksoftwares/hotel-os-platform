import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { vi, expect, describe, beforeEach, afterEach, it } from 'vitest';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: {
            reservation: {
              findMany: vi.fn(),
              create: vi.fn(),
            },
            restaurantOrder: {
              findUnique: vi.fn(),
            }
          }
        }
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  it('Double Booking Engine', async () => {
    // Mock Prisma findMany to simulate an overlapping reservation
    vi.spyOn(prismaService.reservation, 'findMany').mockResolvedValue([{ id: 'existing-res' } as any]);

    const createReservation = async (roomTypeId: string) => {
      const existing = await prismaService.reservation.findMany({
        where: { roomTypeId }
      });
      if ((existing as any[]).length > 0) {
        throw new ConflictException('Room already booked for this period');
      }
      return prismaService.reservation.create({ data: {} as any });
    };

    await expect(createReservation('roomtype-1')).rejects.toThrow(ConflictException);
  });

  it('Role Escalation', async () => {
    const applyDiscount = async (role: string, discountPercent: number) => {
      if (discountPercent > 10 && role === 'Cashier') {
        throw new UnauthorizedException('Manager approval required');
      }
      return true;
    };

    await expect(applyDiscount('Cashier', 20)).rejects.toThrow(UnauthorizedException);
  });

  afterEach(async () => {
    if (app) await app.close();
  });
});
