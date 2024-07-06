import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service'

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService){}

	@Mutation(()=>String)
	public async signup():Promise<string> {
		console.log('signUp')
		return await this.memberService.signup()
	}
	@Mutation(() => String)
	public async login(): Promise<string> {
		console.log('Mutation: Log-in');
		return await this.memberService.login();
	}

	@Mutation(() => String)
	public async updateMember(): Promise<string> {
		console.log('Mutation: Update-Member');
		return await this.memberService.updateMember();
	}

	@Query(() => String)
	public async getMember(): Promise<string> {
		console.log('Query: GetMember');
		return await this.memberService.getMember();
	}
}
