import { Test, TestingModule } from '@nestjs/testing';
import { KitchenService } from './kitchen.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { WebsocketGateway } from '../realtime/websocket/realtime/websocket.gateway.js';

describe('KitchenService', () => {
  let service: KitchenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KitchenService,
        { provide: PrismaService, useValue: {} },
        { provide: WebsocketGateway, useValue: {} },
      ],
    }).compile();

    service = module.get<KitchenService>(KitchenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
