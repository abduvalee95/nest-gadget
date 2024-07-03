import { Module } from '@nestjs/common';
import { GadgetBatchController } from './gadget-batch.controller';
import { GadgetBatchService } from './gadget-batch.service';

@Module({
  imports: [],
  controllers: [GadgetBatchController],
  providers: [GadgetBatchService],
})
export class GadgetBatchModule {}
