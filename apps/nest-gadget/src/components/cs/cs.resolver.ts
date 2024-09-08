import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CsService } from './cs.service'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../auth/guards/auth.guard'
import { CsInput, NoticesInquiry } from '../../libs/dto/cs/cs.input'
import { AuthMember } from '../auth/decorators/authMember.decorator'
import { ObjectId } from 'mongoose'
import { Notice, Notices } from '../../libs/dto/cs/cs'
import { Roles } from '../auth/decorators/roles.decorator'
import { MemberType } from '../../libs/enums/member.enum'
import { WithoutGuard } from '../auth/guards/without.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { shapeIntoMongoObjectId } from '../../libs/config'

@Resolver()
export class CsResolver {
	constructor( private readonly csService: CsService){}

	@Roles(MemberType.ADMIN)
@UseGuards(RolesGuard)
@Mutation((returns) => Notice)
public async createNotice(
	@Args('input') input: CsInput,
	@AuthMember('_id') memberId: ObjectId,
): Promise<Notice> {
	console.log('Mutation:>:: CreateNotice');
	return await this.csService.createNotice(memberId, input);
}

@UseGuards(WithoutGuard)
@Query((returns) => Notices)
public async getNotices(
	@Args('input') input: NoticesInquiry,
):Promise<Notices>{
console.log('Query getNotice')
return await this.csService.getNotices(input)
}

@Roles(MemberType.ADMIN)
@UseGuards(RolesGuard)
@Mutation((returns) => Notice)
public async removeNotice(
	@Args('articleId') input: string,
	@AuthMember('_id') memberId: ObjectId,
): Promise<Notice> {
	console.log('Mutation:> AdminUpdateBoardArticle');
	const noticeId = shapeIntoMongoObjectId(input);
	return await this.csService.removeNotice(noticeId)

}
}
