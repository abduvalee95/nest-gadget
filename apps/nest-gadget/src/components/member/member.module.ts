import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../../schemas/Member.model';
import { MemberResolver } from './member.resolver';
import { MemberService } from './member.service';
import { AuthModule } from '../auth/auth.module'
import { ViewModule } from '../view/view.module'
import { LikeModule } from '../like/like.module'
import FollowSchema from '../../schemas/Follow.model'
import { NotificationModule } from '../notification/notification.module'

@Module({
	imports: [
		MongooseModule.forFeature([{name: 'Member',schema: MemberSchema,},]),
		MongooseModule.forFeature([{name: 'Follow',schema: FollowSchema,},]),
		AuthModule,
		ViewModule,
		LikeModule,
		NotificationModule,
	],
	providers: [MemberService, MemberResolver],
	exports: [MemberService],
})
export class MemberModule {}
