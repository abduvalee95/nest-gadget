import { NestFactory } from '@nestjs/core';
import { GadgetBatchModule } from './gadget-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(GadgetBatchModule);
  await app.listen(3000);
}
bootstrap();
