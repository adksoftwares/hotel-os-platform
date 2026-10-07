import { Test, TestingModule } from '@nestjs/testing';
import { Realtime\websocketGateway } from './realtime\websocket.gateway.js';

describe('Realtime\websocketGateway', () => {
  let gateway: Realtime\websocketGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Realtime\websocketGateway],
    }).compile();

    gateway = module.get<Realtime\websocketGateway>(Realtime\websocketGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
