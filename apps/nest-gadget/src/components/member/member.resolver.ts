import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Member, Members } from '../../libs/dto/member/member';
import { AgentsInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { MemberService } from './member.service';

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
	public async getMember(@Args('memberId') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Member> {
		console.log('Query: getMember');
		console.log(memberId);
		const targetId = shapeIntoMongoObjectId(input);
		return await this.memberService.getMember(memberId, targetId);
	}

	//* 														GetAgents

	@UseGuards(WithoutGuard)
	@Query(() => Members) // querybni hoizil qilyabmiz u
	public async getAgents(
		@Args('input') input: AgentsInquiry, //
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Members> {
		console.log('Query: GetAgents');
		return await this.memberService.getAgents(memberId, input);
	}

	/* // *******************************************************************
	!																			ADMIN  
	* ***********************************************************************/

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Members)
	public async getAllMembersByAdmin(@Args('input') input: MembersInquiry): Promise<Members> {
		console.log('Mutation: getAllMemberByAdmin');
		return await this.memberService.getAllMemberByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Member)
	public async updateMemberByAdmin(@Args('input') input: MemberUpdate): Promise<Member> {
		console.log('Mutation: updatelMemberByAdmin');
		return await this.memberService.updateMemberByAdmin(input);
	}
}
