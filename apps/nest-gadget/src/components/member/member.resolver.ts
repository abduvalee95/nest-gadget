import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Member } from '../../libs/dto/member/member';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { MemberService } from './member.service';
import { AuthGuard } from '../auth/guards/auth.guard'
import { MemberUpdate } from '../../libs/dto/member/member.update'
import { ObjectId } from 'mongoose'
import { AuthMember } from '../auth/decorators/authMember.decorator'
import { WithoutGuard } from '../auth/guards/without.guard'
import { shapeIntoMongoObjectId } from '../../libs/config'
import { Roles } from '../auth/decorators/roles.decorator'
import { MemberType } from '../../libs/enums/member.enum'
import { RolesGuard } from '../auth/guards/roles.guard'

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {}

	@Mutation(() => Member)
	@UsePipes(ValidationPipe)
	public async signup(@Args('input') input: MemberInput): Promise<Member> {
			console.log('SignUp:>>');
			return await this.memberService.signup(input);
	}

	@Mutation(() => Member)
	@UsePipes(ValidationPipe)
	public async login(@Args('input') input: LoginInput): Promise<Member> {
			console.log('Mutation: Log-in');
			return await this.memberService.login(input);
	}

	//* 														CheckAuth

	@UseGuards(AuthGuard) 
	@Query(() => String)
	public async checkAuth(@AuthMember('memberNick') memberNick: string): Promise<string> {
		console.log('Query: checkAuth');
		console.log(memberNick);
		return `Hello ${memberNick},`;
	}

	//* 														checkAuthRoles

	@Roles(MemberType.SELLER, MemberType.USER)
	@UseGuards(RolesGuard) //* Autherization tekshiriladi
	@Query(() => String)
	public async checkAuthRoles(@AuthMember() authMember: Member): Promise<string> {
		console.log('Query: checkAuthRoles');

		return `Hello ${authMember.memberNick}, You are: ${authMember.memberType}, ID: (${authMember._id})`;
	}

	//* 														UpdateMember

	@UseGuards(AuthGuard)
	@Mutation(() => Member)
	public async updateMember(
		@Args('input') input: MemberUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Member> {
		console.log('Mutation: Update-Member');
		delete input._id; 
		return await this.memberService.updateMember(memberId, input);
	}

	//* 														GetMember

	@UseGuards(WithoutGuard)
	@Query(() => Member)
	public async getMember(
		@Args('memberId') input: string, 
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Member> {
		console.log('Query: getMember');
		console.log(memberId);
		const targetId = shapeIntoMongoObjectId(input);
		return await this.memberService.getMember(memberId, targetId);
	}

}
