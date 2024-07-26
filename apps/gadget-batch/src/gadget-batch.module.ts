import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import GadgetSchema from 'apps/nest-gadget/src/schemas/Gadget.model'
import MemberSchema from 'apps/nest-gadget/src/schemas/Member.model'
import { BatchController } from './gadget-batch.controller'
import { BatchService } from './gadget-batch.service'


@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule, ScheduleModule.forRoot(),
    MongooseModule.forFeature([{name:'Gadget', schema:GadgetSchema}]),
    MongooseModule.forFeature([{name:'Member', schema:MemberSchema}]),

  ],
	controllers: [BatchController],
	providers: [BatchService],
})
export class GadgetBatchModule {}
