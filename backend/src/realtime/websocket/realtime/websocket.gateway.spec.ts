import { Test, TestingModule } from '@nestjs/testing';
import { WebsocketGateway } from './websocket.gateway.js';
import { JwtService } from '@nestjs/jwt';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('WebsocketGateway', () => {
  let gateway: WebsocketGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebsocketGateway,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: vi.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<WebsocketGateway>(WebsocketGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
