import { Module } from '@nestjs/common';
import { CsResolver } from './cs.resolver';
import { CsService } from './cs.service';
import { MongooseModule } from '@nestjs/mongoose'
import NoticeSchema from '../../schemas/Notice.model'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Notice', schema: NoticeSchema}]),
    AuthModule,
  ],
  providers: [CsResolver, CsService],
  exports:[CsService]
})
export class CsModule {}
