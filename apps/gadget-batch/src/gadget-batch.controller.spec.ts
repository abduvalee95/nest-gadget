import { Test, TestingModule } from '@nestjs/testing';
import { GadgetBatchController } from './gadget-batch.controller';
import { GadgetBatchService } from './gadget-batch.service';

describe('GadgetBatchController', () => {
  let gadgetBatchController: GadgetBatchController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GadgetBatchController],
      providers: [GadgetBatchService],
    }).compile();

    gadgetBatchController = app.get<GadgetBatchController>(GadgetBatchController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(gadgetBatchController.getHello()).toBe('Hello World!');
    });
  });
});
