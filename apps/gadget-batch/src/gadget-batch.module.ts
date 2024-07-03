import { Module } from '@nestjs/common';
import { GadgetBatchController } from './gadget-batch.controller';
import { GadgetBatchService } from './gadget-batch.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [GadgetBatchController],
  providers: [GadgetBatchService],
})
export class GadgetBatchModule {}
