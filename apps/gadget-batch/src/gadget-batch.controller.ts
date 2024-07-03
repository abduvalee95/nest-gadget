import { Controller, Get } from '@nestjs/common';
import { GadgetBatchService } from './gadget-batch.service';

@Controller()
export class GadgetBatchController {
  constructor(private readonly gadgetBatchService: GadgetBatchService) {}

  @Get()
  getHello(): string {
    return this.gadgetBatchService.getHello();
  }
}
