import { Test, TestingModule } from '@nestjs/testing';
import { PosController } from './pos.controller.js';
import { PosService } from './pos.service.js';

describe('PosController', () => {
  let controller: PosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PosController],
      providers: [
        { provide: PosService, useValue: {} },
      ],
    }).compile();

    controller = module.get<PosController>(PosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
