import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Member, Members } from '../../libs/dto/member/member';
import { AgentsInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { ViewInput } from '../../libs/dto/view/view.input';
import { Message } from '../../libs/enums/common.enums';
import { Direction, MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { AuthService } from '../auth/auth.service';
import { ViewService } from '../view/view.service';
import { LikeInput } from '../../libs/dto/like/like.input'
import { LikeGroup } from '../../libs/enums/like.enum'
import { LikeService } from '../like/like.service'
import { Follower, Following, MeFollowed } from '../../libs/dto/follow/follow'
import { lookupAuthMemberLiked } from '../../libs/config'

@Injectable()
export class MemberService {
	constructor(
		@InjectModel('Member')
		private readonly memberModel: Model<Member>,
		@InjectModel('Follow')
		private readonly followModel: Model<Follower | Following>,
		private readonly authService: AuthService,
		private readonly viewService: ViewService,
		private readonly likeService: LikeService,
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

			//* meLiked
			const likeInput = { memberId: memberId, likeRefId: targetId, likeGroup: LikeGroup.MEMBER, notificationRefId:null, notificationGroup: null }; //!
			targetMember.meLiked = await this.likeService.checkLikeExistance(likeInput);

			//* meFolloweed
			targetMember.meFollowed = await this.checkSubscription(memberId, targetId);
		}

		return targetMember;
	}

	//* 														getAgents

	public async getAgents(memberId: ObjectId, input: AgentsInquiry): Promise<Members> {
		const { text } = input.search;
		const match: T = { memberType: MemberType.AGENT, memberStatus: MemberStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC }; // sort xamda direction kiritilmagan  bolsa createdAt da xosil qiladi Directiondi Desc da xosil qiladi -1

		if (text) match.memberNick = { $regex: new RegExp(text, 'i') };
		console.log('match:::', match);

		const result = await this.memberModel
			.aggregate([
				{ $match: match }, //filterlab olamiz
				{ $sort: sort }, //sortlab olamiz
				{
					$facet: {
						/** bir nechta piplenilarni birvaqtda amalga oshirmoqchi bolsek */
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupAuthMemberLiked(memberId),
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
	!																			CHECK 
	* ***********************************************************************/

	private async checkSubscription(followerId: ObjectId, followingId: ObjectId): Promise<MeFollowed[]> {
		const result = await this.followModel.findOne({ followingId: followingId, followerId: followerId }).exec();
		return result ? [{ followerId: followerId, followingId: followingId, myFollowing: true }] : [];
	}

		/* // *******************************************************************
	!																			LIKE 
	* ***********************************************************************/
	public async likeTargetMember(memberId: ObjectId, likeRefId: ObjectId): Promise<Member> {
		//variable ochamiz va izlemiz id :refId sini memberStatus.Active bolish kk
		const target: Member = await this.memberModel.findOne({ _id: likeRefId, memberStatus: MemberStatus.ACTIVE }).exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.MEMBER,
			//!
			notificationRefId:null,
			notificationGroup: null
		};

		//Togle
		const modifier: number = await this.likeService.toggleLike(input); // bu bosilganda ishlasa
		const result = await this.memberStatsEditor({ _id: likeRefId, targetKey: 'memberLikes', modifier: modifier }); //bu oshirib beryabti

		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		return result;
	}

	/* // *******************************************************************
	!																			ADMIN  
	* ***********************************************************************/

	public async getAllMemberByAdmin(input: MembersInquiry): Promise<Members> {
		const { memberStatus, memberType, text } = input.search;
		const match: T = {}; //Xar qanday memberlarni olib Berish ikk Agent user
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC }; // sort xamda direction kiritilmagan  bolsa createdAt da xosil qiladi Directiondi Desc da xosil qiladi -1

		if (memberStatus) match.memberStatus = memberStatus; // members statusi kiritilgan bolsa poiskga shu member statuslardi olib beradi m: faqat agentlardi block,a ctive
		if (memberType) match.memberType = memberType; // member type bn izlasa User,agent
		if (text) match.memberNick = { $regex: new RegExp(text, 'i') };
		console.log('match:::', match);

		const result = await this.memberModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						/** bir nechta piplenilarni birvaqtda amalga oshirmoqchi bolsek */
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }], // biz talab etayotgan memberlar Adminlarham bolish mm
						metaCounter: [{ $count: 'total' }], // umumiy memberrlarni chiqaradi
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	public async updateMemberByAdmin(input: MemberUpdate): Promise<Member> {
		const result: Member = await this.memberModel.findOneAndUpdate({ _id: input._id }, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FALED);

		return result;
	}

		// memberni malumotlarni tashqaridan manipulate qilishimiz kk
		public async memberStatsEditor(input: StatisticModifier): Promise<Member> {
			console.log('memberStatsEditor:::');
	
			const { _id, targetKey, modifier } = input;
			return await this.memberModel.findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true }).exec();
		}
}
