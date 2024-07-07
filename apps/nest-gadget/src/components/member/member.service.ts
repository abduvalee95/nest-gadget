import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Message } from '../../libs/enums/common.enums';
import { MemberStatus } from '../../libs/enums/member.enum';
import { AuthService } from '../auth/auth.service'

@Injectable()
export class MemberService {
	constructor(@InjectModel('Member') private readonly memberModel: Model<Member>, private readonly authService: AuthService) {}
	public async signup(input: MemberInput): Promise<Member> {
		input.memberPassword = await this.authService.hashPassword(input.memberPassword)

		try {
			const result = await this.memberModel.create(input);
			result.accessToken = await this.authService.createToken(result);
			return result;
		} catch (error) {
			console.log(error);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
		
	}

	public async login(input: LoginInput): Promise<Member> {

		const { memberNick, memberPassword } = input;
		const response: Member = await this.memberModel
			.findOne({ memberNick: memberNick })
			.select('+memberPassword')
			.exec();

		if (!response || response.memberStatus === MemberStatus.DELETE) {
			throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
		} else if (response.memberStatus === MemberStatus.BLOCK) {
			throw new InternalServerErrorException(Message.BLOCKED_USER);
		}

		//todo Compare Paswords with bycrypt
		const isMatch = await this.authService.comparePassword(input.memberPassword,response.memberPassword)
		if (!isMatch) throw new InternalServerErrorException(Message.WRONG_PASSWORD)

			response.accessToken = await this.authService.createToken(response)
		return response;
	}

	public async updateMember(): Promise<string> {
		return 'updateMember executed';
	}

	public async getMember(): Promise<string> {
		return 'getMember executed';
	}
}
