import { Test, TestingModule } from '@nestjs/testing';
import { KitchenController } from './kitchen.controller.js';
import { KitchenService } from './kitchen.service.js';

describe('KitchenController', () => {
  let controller: KitchenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KitchenController],
      providers: [
        { provide: KitchenService, useValue: {} },
      ],
    }).compile();

    controller = module.get<KitchenController>(KitchenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
