import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { Message } from '../../libs/enums/common.enums';
import { MemberStatus } from '../../libs/enums/member.enum';
import { T } from '../../libs/types/common';
import { AuthService } from '../auth/auth.service';
import { ViewService } from '../view/view.service';
import { ViewGroup } from '../../libs/enums/view.enum'
import { ViewInput } from '../../libs/dto/view/view.input'

@Injectable()
export class MemberService {
	constructor(
		@InjectModel('Member')
		private readonly memberModel: Model<Member>,
		private readonly authService: AuthService,
		private readonly viewService: ViewService,
	) {}

	public async signup(input: MemberInput): Promise<Member> {
		input.memberPassword = await this.authService.hashPassword(input.memberPassword);

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
		const isMatch = await this.authService.comparePassword(input.memberPassword, response.memberPassword);
		if (!isMatch) throw new InternalServerErrorException(Message.WRONG_PASSWORD);

		response.accessToken = await this.authService.createToken(response);
		return response;
	}

	//* 														UpdateMember

	public async updateMember(memberId: ObjectId, input: MemberUpdate): Promise<Member> {
		const result: Member = await this.memberModel
			.findOneAndUpdate(
				{
					_id: memberId,
					memberStatus: MemberStatus.ACTIVE,
				},
				input,
				{ new: true },
			)
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FALED);

		result.accessToken = await this.authService.createToken(result); // accessTokendi yangilamasak Frontendda u ozgarishsiz qoladi
		return result;
	}

	//* 														getMember

	public async getMember(memberId: ObjectId, targetId: ObjectId): Promise<Member> {
		const search: T = {
			_id: targetId,
			memberStatus: {
				$in: [MemberStatus.ACTIVE, MemberStatus.BLOCK],
			},
		};
		const targetMember = await this.memberModel.findOne(search).lean().exec();
		if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		// Bu Erda agar Murojatchini Id si "login-bolgan" bolsa biz View ni 1 ga oshiramiz aks holdas oshirmimiz
		if (memberId) {
				//		kim tomosha qilyabti, mimani tomosha q-ti,
			const viewInput: ViewInput = { memberId: memberId, viewRefId: targetId, viewGroup: ViewGroup.MEMBER };
			const newView = await this.viewService.recordView(viewInput); // agar  record ishga tushub yangi View ni +1 oshiradi
			if (newView) {
				await this.memberModel.findOneAndUpdate(search, { $inc: { memberViews: 1 } }, { new: true }).exec();
				targetMember.memberViews++;
			}
			/*
			//* meLiked
			const likeInput = { memberId: memberId, likeRefId: targetId, likeGroup: LikeGroup.MEMBER };
			targetMember.meLiked = await this.likeService.checkLikeExistance(likeInput);

			//* meFolloweed
			targetMember.meFollowed = await this.checkSubscription(memberId, targetId);*/
		}

		return targetMember;
	}
}
