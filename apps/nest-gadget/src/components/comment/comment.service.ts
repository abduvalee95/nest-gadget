import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { lookupMember } from '../../libs/config';
import { Comment, Comments } from '../../libs/dto/comment/comment';
import { CommentInput, CommentsInquiry } from '../../libs/dto/comment/comment.input';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { Message } from '../../libs/enums/common.enums';
import { Direction } from '../../libs/enums/member.enum';
import { T } from '../../libs/types/common';
import { BoardArticleService } from '../board-article/board-article.service';
import { GadgetService } from '../gadget/gadget.service';
import { MemberService } from '../member/member.service';
import { NotificationService } from '../notification/notification.service'
import { NotificationGroup, NotificationType } from '../../libs/enums/notification.enum'

@Injectable()
export class CommentService {
	constructor(
		@InjectModel('Comment') private readonly commentModule: Model<Comment>,
		private readonly memberService: MemberService,
		private readonly gadgetService: GadgetService,
		private readonly boardArticleService: BoardArticleService,
		private readonly notificationService: NotificationService,
	) {}

	public async createComment(memberId: ObjectId, input: CommentInput): Promise<Comment> {
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
				await this.gadgetService.propertyStatsEditor({
					_id: input.commentRefId,
					targetKey: 'gadgetComments',
					modifier: 1,
				});
				break;
			case CommentGroup.ARTICLE:
				await this.boardArticleService.boardArticleStateEditor({
					_id: input.commentRefId,
					targetKey: 'articleComments',
					modifier: 1,
				});
				break;
			case CommentGroup.MEMBER:
				await this.memberService.memberStatsEditor({
					_id: input.commentRefId,
					targetKey: 'memberComments',
					modifier: 1,
				});
				break;
		}
		await this.createCommentNotification(input,result)
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
