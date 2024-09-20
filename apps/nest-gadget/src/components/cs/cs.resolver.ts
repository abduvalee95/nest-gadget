import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Notice, Notices } from '../../libs/dto/cs/cs';
import { CsInput, NoticesInquiry } from '../../libs/dto/cs/cs.input';
import { NoticeUpdate } from '../../libs/dto/cs/cs.update';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { CsService } from './cs.service';

@Resolver()
export class CsResolver {
	constructor(private readonly csService: CsService) {}

	@UseGuards(WithoutGuard)
	@Query((returns) => Notices)
	public async getNotices(@Args('input') input: NoticesInquiry): Promise<Notices> {
		console.log('Query getNotice');
		return await this.csService.getNotices(input);
	}

	/** ADMIN **/
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Notice)
	public async createNotice(@Args('input') input: CsInput, @AuthMember('_id') memberId: ObjectId): Promise<Notice> {
		console.log('Mutation:>:: CreateNotice');
		return await this.csService.createNotice(memberId, input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Notice)
	public async updateNoticeByAdmin(
		@Args('noticeId') input: NoticeUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notice> {
		console.log('Mutation: updateNoticeByAdmin');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.csService.updateNoticeByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Notice)
	public async removeNotice(@Args('noticeId') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Notice> {
		console.log('Mutation:> AdminUpdateBoardArticle');
		const noticeId = shapeIntoMongoObjectId(input);
		return await this.csService.removeNotice(noticeId);
	}
}
