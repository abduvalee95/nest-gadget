import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CsService } from './cs.service'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../auth/guards/auth.guard'
import { CsInput } from '../../libs/dto/cs/cs.input'
import { AuthMember } from '../auth/decorators/authMember.decorator'
import { ObjectId } from 'mongoose'
import { Notice } from '../../libs/dto/cs/cs'

@Resolver()
export class CsResolver {
	constructor( private readonly csService: CsService){}

	@UseGuards(AuthGuard)
@Mutation((returns) => Notice)
public async createNotice(
	@Args('input') input: CsInput,
	@AuthMember('_id') memberId: ObjectId,
): Promise<Notice> {
	console.log('Mutation:>:: CreateNotice');
	return await this.csService.createNotice(memberId, input);
}
}
