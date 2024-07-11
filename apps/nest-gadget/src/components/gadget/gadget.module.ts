import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import GadgetSchema from '../../schemas/Gadget.model';
import { GadgetResolver } from './gadget.resolver';
import { GadgetService } from './gadget.service';
import { AuthModule } from '../auth/auth.module'
import { ViewModule } from '../view/view.module'
import { MemberModule } from '../member/member.module'

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Gadget',
				schema: GadgetSchema,
			},
		]),
    AuthModule,
    ViewModule,
    MemberModule,
	],
	providers: [GadgetService, GadgetResolver],
})
export class GadgetModule {}
