import { Module } from '@nestjs/common';
import { NotificationResolver } from './notification.resolver';
import { NotificationService } from './notification.service';
import { MongooseModule } from '@nestjs/mongoose'
import NotificationSchema from '../../schemas/Notification.model'
import { CommentModule } from '../comment/comment.module'
import { MemberModule } from '../member/member.module'

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: 'Notification', schema: NotificationSchema
    }]),
  ],
  providers: [NotificationResolver, NotificationService],
  exports:[NotificationService]
})
export class NotificationModule {}
