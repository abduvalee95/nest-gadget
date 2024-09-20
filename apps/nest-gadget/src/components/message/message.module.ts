import { Module } from '@nestjs/common';
import { MessageResolver } from './message.resolver';
import { MessageService } from './message.service';
import MemberSchema from '../../schemas/Member.model'
import { MongooseModule } from '@nestjs/mongoose'
import MessageSchema from '../../schemas/Message.model'
import NotificationSchema from '../../schemas/Notification.model'
import { AuthModule } from '../auth/auth.module'
import { MemberModule } from '../member/member.module'
import { NotificationModule } from '../notification/notification.module'

@Module({
	imports:[MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),
	MongooseModule.forFeature([{ name: 'Notification', schema: NotificationSchema }]),
	MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
	AuthModule, //
	MemberModule,
	NotificationModule,
],
  providers: [MessageResolver, MessageService]
})
export class MessageModule {}
