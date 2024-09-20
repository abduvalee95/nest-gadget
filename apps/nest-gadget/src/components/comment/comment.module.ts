import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import CommentSchema from '../../schemas/Comment.model';
import { AuthModule } from '../auth/auth.module';
import { BoardArticleModule } from '../board-article/board-article.module';
import { GadgetModule } from '../gadget/gadget.module';
import { MemberModule } from '../member/member.module';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';
import { NotificationModule } from '../notification/notification.module'
import GadgetSchema from '../../schemas/Gadget.model'
import BoardArticleSchema from '../../schemas/BoardArticle.model'
import MemberSchema from '../../schemas/Member.model'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
		MongooseModule.forFeature([{ name: 'Gadget', schema: GadgetSchema }]),
		MongooseModule.forFeature([{ name: 'BoardArticle', schema: BoardArticleSchema }]),
		MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema}]),
		AuthModule,
		MemberModule,
		GadgetModule,
		BoardArticleModule,
		NotificationModule,
	],
	providers: [CommentService, CommentResolver],
})
export class CommentModule {}
