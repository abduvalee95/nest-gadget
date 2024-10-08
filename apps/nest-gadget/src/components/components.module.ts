import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BoardArticleModule } from './board-article/board-article.module';
import { CommentModule } from './comment/comment.module';
import { FollowModule } from './follow/follow.module';
import { GadgetModule } from './gadget/gadget.module';
import { LikeModule } from './like/like.module';
import { MemberModule } from './member/member.module';
import { ViewModule } from './view/view.module';
import { NotificationModule } from './notification/notification.module';
import { CsModule } from './cs/cs.module';
import { FaqModule } from './faq/faq.module';
import { MessageModule } from './message/message.module';

@Module({
	imports: [
		MemberModule,
		AuthModule,
		GadgetModule,
		BoardArticleModule,
		CommentModule,
		FollowModule,
		LikeModule,
		ViewModule,
		NotificationModule,
		CsModule,
		FaqModule,
		MessageModule,
	],
})
export class ComponentsModule {}
