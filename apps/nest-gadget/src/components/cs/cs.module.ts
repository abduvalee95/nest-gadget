import { Module } from '@nestjs/common';
import { CsResolver } from './cs.resolver';
import { CsService } from './cs.service';

@Module({
  providers: [CsResolver, CsService]
})
export class CsModule {}
