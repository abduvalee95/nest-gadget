import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import GadgetSchema from '../../schemas/Gadget.model';
import { GadgetResolver } from './gadget.resolver';
import { GadgetService } from './gadget.service';
import { AuthModule } from '../auth/auth.module'
import { ViewModule } from '../view/view.module'
import { MemberModule } from '../member/member.module'
import { LikeModule } from '../like/like.module'
import MemberSchema from '../../schemas/Member.model'
import { NotificationModule } from '../notification/notification.module'

@Module({
	imports: [
		MongooseModule.forFeature([{name: 'Gadget', schema: GadgetSchema, }, ]),
		MongooseModule.forFeature([{name: 'Member', schema: MemberSchema, }, ]),
    AuthModule,
    ViewModule,
    MemberModule,
    LikeModule,
		NotificationModule
	],
	providers: [GadgetService, GadgetResolver],
	exports:[GadgetService]
})
export class GadgetModule {}
