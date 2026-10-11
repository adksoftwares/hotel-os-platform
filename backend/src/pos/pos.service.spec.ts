import { Test, TestingModule } from '@nestjs/testing';
import { PosService } from './pos.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { WebsocketGateway } from '../realtime/websocket/realtime/websocket.gateway.js';

describe('PosService', () => {
  let service: PosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PosService,
        { provide: PrismaService, useValue: {} },
        { provide: WebsocketGateway, useValue: {} },
      ],
    }).compile();

    service = module.get<PosService>(PosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
