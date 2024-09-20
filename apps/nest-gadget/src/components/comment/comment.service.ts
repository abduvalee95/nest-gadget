import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { lookupMember } from '../../libs/config';
import { BoardArticle } from '../../libs/dto/board-article/board-article';
import { Comment, Comments } from '../../libs/dto/comment/comment';
import { CommentInput, CommentsInquiry } from '../../libs/dto/comment/comment.input';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { Gadget } from '../../libs/dto/gadget/gadget';
import { Member } from '../../libs/dto/member/member';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { Message } from '../../libs/enums/common.enums';
import { Direction } from '../../libs/enums/member.enum';
import { NotificationGroup, NotificationType } from '../../libs/enums/notification.enum';
import { T } from '../../libs/types/common';
import { BoardArticleService } from '../board-article/board-article.service';
import { GadgetService } from '../gadget/gadget.service';
import { MemberService } from '../member/member.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class CommentService {
	constructor(
		@InjectModel('Comment') private readonly commentModule: Model<Comment>,
		@InjectModel('Gadget') private readonly gadgetModel: Model<Gadget>,
		@InjectModel('BoardArticle') private readonly boardArticleModel: Model<BoardArticle>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		private readonly memberService: MemberService,
		private readonly gadgetService: GadgetService,
		private readonly boardArticleService: BoardArticleService,
		private readonly notificationService: NotificationService,
	) {}

	public async createComment(memberId: ObjectId, input: CommentInput): Promise<Comment> {
		const member = await this.memberModel.findById(memberId).exec();
		input.memberId = memberId;
		let result = null;
		try {
			result = await this.commentModule.create(input);
			// Comment hosil bolganda Notification hosil qilamiz Serivise iwledi
		} catch (error) {
			console.log('Error CreateCommentServiceModel', error.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}

		switch (input.commentGroup) {
			case CommentGroup.GADGET:
				const gadget = await this.gadgetModel.findById(input.commentRefId);
				if (!gadget) throw new InternalServerErrorException('Gadget not found');
				await this.gadgetService.propertyStatsEditor({
					_id: input.commentRefId,
					targetKey: 'gadgetComments',
					modifier: 1,
				});

				// 1-------------Notification-----propertyComments---------
				await this.notificationService.createNotification(memberId, {
					notificationType: NotificationType.COMMENT,
					notificationGroup: NotificationGroup.GADGET,
					notificationTitle: 'New Comment for your Gadget!',
					notificationDesc: `${member.memberNick} commented to your Gadget!`,
					authorId: memberId,
					receiverId: gadget.memberId,
					gadgetId: input.commentRefId,
					articleId: undefined,
				});
				break;
			case CommentGroup.ARTICLE:
				const article = await this.boardArticleModel.findById(input.commentRefId);
				if (!article) throw new InternalServerErrorException('Article not found');
				await this.boardArticleService.boardArticleStateEditor({
					_id: input.commentRefId,
					targetKey: 'articleComments',
					modifier: 1,
				});
					// 2-------------Notification-----articleComments---------
					await this.notificationService.createNotification(memberId, {
						notificationType: NotificationType.COMMENT,
						notificationGroup: NotificationGroup.ARTICLE,
						notificationTitle: 'New Comment for your Article!',
						notificationDesc: `${member.memberNick} commented your article! `,
						authorId: memberId,
						receiverId: article.memberId,
						gadgetId: undefined,
						articleId: input.commentRefId,
					});
				break;
			case CommentGroup.MEMBER:
				await this.memberService.memberStatsEditor({
					_id: input.commentRefId,
					targetKey: 'memberComments',
					modifier: 1,
				});
				// 3-------------Notification------memberComments--------

				await this.notificationService.createNotification(memberId, {
					notificationType: NotificationType.COMMENT,
					notificationGroup: NotificationGroup.MEMBER,
					notificationTitle: 'New Comment for you',
					notificationDesc: `${member.memberNick} Commented to you! `,
					authorId: memberId,
					receiverId: input.commentRefId,
					gadgetId: undefined,
					articleId: undefined,
				});
				break;
		}
		// await this.createCommentNotification(input, result);
		// await this.memberService.memberStatsEditor({ _id: input.commentRefId, targetKey: 'notifications', modifier: 1 });
		if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);
		return result;
	}

	private getNotificationGroup(commentGroup: CommentGroup): NotificationGroup {
		switch (commentGroup) {
			case CommentGroup.GADGET:
				return NotificationGroup.GADGET;
			case CommentGroup.ARTICLE:
				return NotificationGroup.ARTICLE;
			case CommentGroup.MEMBER:
				return NotificationGroup.MEMBER;
			default:
				throw new BadRequestException('Invalid comment group for notification');
		}
	}

	private async createCommentNotification(input: CommentInput, comment: Comment): Promise<void> {
		try {
			//@ts-ignore
			await this.notificationService.toggleNotification(input.memberId, {
				memberId: input.memberId,
				notificationRefId: input.commentRefId,
				notificationType: NotificationType.COMMENT,
				notificationGroup: this.getNotificationGroup(input.commentGroup),
				authorId: input.memberId,
				receiverId: this.getReceiverId(input),
				notificationTitle: 'New Comment',
				notificationDesc: 'Someone commented on your content.',
			});
		} catch (error) {
			console.error('Error in CommentService - createCommentNotification:', error.message);
			throw new InternalServerErrorException(Message.CREATE_FAILED);
		}
	}

	private getReceiverId(input: CommentInput): ObjectId {
		// Logic to determine the receiver of the notification
		// This is usually the author of the content that is being commented on
		return input.commentRefId; // Assuming `commentRefId` refers to the content's owner
	}

	public async updateComment(memberId: ObjectId, input: CommentUpdate): Promise<Comment> {
		const { _id } = input;
		const result = this.commentModule
			.findOneAndUpdate(
				{
					_id: _id,
					memberId: memberId,
					commentStatus: CommentStatus.ACTIVE,
				},
				input,
				{
					new: true,
				},
			)
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FALED);
		return result;
	}

	public async getComments(memberId: ObjectId, input: CommentsInquiry): Promise<Comments> {
		const { commentRefId } = input.search;
		const match: T = { commentRefId: commentRefId, commentStatus: CommentStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const result: Comments[] = await this.commentModule
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							//meLiked
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	/* // *******************************************************************
	!																		ADMIN
	* ***********************************************************************/
	public async removeCommentByAdmin(input: ObjectId): Promise<Comment> {
		const result = await this.commentModule.findOneAndDelete(input).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		return result;
	}
}
