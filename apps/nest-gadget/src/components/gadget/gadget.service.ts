import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Gadget, Gadgets } from '../../libs/dto/gadget/gadget'
import { Model, ObjectId } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { AllGadgetsInquiry, GadgetInput, GadgetsInquiry, OrdinaryInquiry, SellerGadgetsInquiry } from '../../libs/dto/gadget/gadget.input'
import { MemberService } from '../member/member.service'
import { Message } from '../../libs/enums/common.enums'
import { StatisticModifier, T } from '../../libs/types/common'
import { GadgetStatus } from '../../libs/enums/gadget.enum'
import { ViewGroup } from '../../libs/enums/view.enum'
import { ViewService } from '../view/view.service'
import { GadgetUpdate } from '../../libs/dto/gadget/gadget.update'
import * as moment from 'moment';
import { Direction } from '../../libs/enums/member.enum'
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config'
import { LikeInput } from '../../libs/dto/like/like.input'
import { LikeGroup } from '../../libs/enums/like.enum'
import { LikeService } from '../like/like.service'
import { NotificationGroup, NotificationType } from '../../libs/enums/notification.enum'
import { Member } from '../../libs/dto/member/member'
import { NotificationService } from '../notification/notification.service'

@Injectable()
export class GadgetService {
	constructor(
		@InjectModel('Gadget') private readonly gadgetModel: Model<Gadget>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		private viewService: ViewService,
		private memberService: MemberService,
		private likeService: LikeService,
		private notificationService: NotificationService,
	){}

		public async createGadget(input: GadgetInput): Promise<Gadget> {
			try {
				const result = await this.gadgetModel.create(input);
	
				await this.memberService.memberStatsEditor({
					_id: result.memberId,
					targetKey: 'memberGadgets',
					modifier: 1,
				});
				return result;
			} catch (error) {
				console.log('Error, Service.Model:', error.message);
				throw new BadRequestException(Message.CREATE_FAILED);
			}
		}
	
		public async getGadget(memberId: ObjectId, gadgetId: ObjectId): Promise<Gadget> {
			const search: T = {
				_id: gadgetId,
				gadgetStatus: GadgetStatus.ACTIVE
			};
			const targetGadget = await this.gadgetModel.findOne(search).lean().exec();
			if (!targetGadget) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
	
			if (memberId) {
				//		kim tomosha qilyabti, mimani tomosha q-ti,
				const viewInput = { memberId: memberId, viewRefId: gadgetId, viewGroup: ViewGroup.GADGET };
				const newView = await this.viewService.recordView(viewInput); // agar record ishga tushub yangi View ni +1 oshiradi
				if (newView) {
					await this.propertyStatsEditor({ _id: gadgetId, targetKey: 'gadgetViews', modifier: 1 });
					targetGadget.gadgetViews++;
				}
				//meLiked
				const likeInput = { memberId: memberId, likeRefId: gadgetId, likeGroup: LikeGroup.GADGET,notificationGroup:NotificationGroup.GADGET,notificationRefId: null };
				targetGadget.meLiked = await this.likeService.checkLikeExistance(likeInput);
			}
			targetGadget.memberData = await this.memberService.getMember(null, targetGadget.memberId);
			return targetGadget;
		}

	public async updateGadget(memberId: ObjectId, input: GadgetUpdate): Promise<Gadget> {
		let { gadgetStatus, soldAt, deletedAt } = input,
			search: T = {
				_id: input._id, // qaysi propertyni yangilay oladi
				memberId: memberId, // oziga tegishlikni member Id orqali bilib olyabmiz
				gadgetStatus: GadgetStatus.ACTIVE,
			};
		if (gadgetStatus === GadgetStatus.SOLD) soldAt = moment().toDate();
		else if (gadgetStatus === GadgetStatus.DELETE) deletedAt = moment().toDate();

		const result = await this.gadgetModel
			.findOneAndUpdate(search, input, {
				new: true,
			})
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FALED);

		if (soldAt || deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: memberId,
				targetKey: 'memberGadgets',
				modifier: -1,
			});
		}
		return result;
	}

	public async getGadgets(memberId: ObjectId, input: GadgetsInquiry): Promise<Gadgets> {
		const match: T = { gadgetStatus: GadgetStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC }; 

		//shape
		this.shapeMatchQuery(match, input); // complex logic bolgani uchuun aloxidayozdik
		console.log(match);

		const result = await this.gadgetModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						/** bir nechta piplenilarni birvaqtda amalga oshirmoqchi bolsek */
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							//me liked
							lookupAuthMemberLiked(memberId),
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



	public async getFavorites(memberId: ObjectId, input: OrdinaryInquiry): Promise<Gadgets> {
		return await this.likeService.getFavoriteGadgets(memberId, input); // Asosiy logicni likeserviceda qilamiz 
	}

	public async getVisited(memberId: ObjectId, input: OrdinaryInquiry): Promise<Gadgets> {
		return await this.viewService.getVisitedGadgets(memberId, input); // Asosiy logicni likeserviceda qilamiz 
	}

	public async getSellerGadgets(memberId: ObjectId, input: SellerGadgetsInquiry): Promise<Gadgets> {
		const { gadgetStatus } = input.search;
		if (gadgetStatus === GadgetStatus.DELETE) throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);

		const match: T = { memberId: memberId, gadgetStatus: gadgetStatus ?? { $ne: GadgetStatus.DELETE } }; //Xar qanday memberlarni olib Berish ikk Agent user
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC }; // sort xamda direction kiritilmagan  bolsa createdAt da xosil qiladi Directiondi Desc da xosil qiladi -1

		const result = await this.gadgetModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						/** bir nechta piplenilarni birvaqtda amalga oshirmoqchi bolsek */
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
						], // biz talab etayotgan propperties bolish mm
						metaCounter: [{ $count: 'total' }], // umumiy memberrlarni chiqaradi
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}


	/* // *******************************************************************
	!																			LIKE 
	* ***********************************************************************/

	public async likeTargetGadget(memberId: ObjectId, likeRefId: ObjectId): Promise<Gadget> {
		//variable ochamiz va izlemiz id :refId sini memberStatus.Active bolish kk
		const member = await this.memberModel.findById(memberId).exec()
		const target = await this.gadgetModel.findOne({ _id: likeRefId, gadgetStatus: GadgetStatus.ACTIVE }).exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.GADGET,
			notificationGroup:NotificationGroup.GADGET,
			notificationRefId: null
		};

		//Togle
		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.propertyStatsEditor({ _id: likeRefId, targetKey: 'gadgetLikes', modifier: modifier });

		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		if (modifier > 0) {
			// Assuming modifier > 0 means a like was added
			await this.notificationService.createNotification(memberId, {
				notificationType: NotificationType.LIKE,
				notificationGroup: NotificationGroup.GADGET,
				notificationTitle: 'New Like on your Gadget',
				notificationDesc: `${member.memberNick} liked your Gadget!`,
				authorId: memberId,
				receiverId: target.memberId,
				gadgetId: likeRefId,
			});
		}
		return result;
	}

	/* // *******************************************************************
	!																			ADMIN 
	* ***********************************************************************/

	public async getAllGadgetsByAdmin(input: AllGadgetsInquiry): Promise<Gadgets> {
		const { gadgetStatus, gadgetLocationList } = input.search;

		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (gadgetStatus) match.gadgetStatus = gadgetStatus;
		if (gadgetLocationList) match.gadgetLocation = { $in: gadgetLocationList };
		const result = await this.gadgetModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						/** bir nechta piplenilarni birvaqtda amalga oshirmoqchi bolsek */
						list: [
							{ $skip: (input.page - 1) * input.limit }, // pagination
							{ $limit: input.limit }, // [property1, property2]
							lookupMember, // [memberData]
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



	public async updateGadgetByAdmin(input: GadgetUpdate): Promise<Gadget> {
		let { gadgetStatus, soldAt, deletedAt } = input,
			search: T = {
				_id: input._id,
				gadgetStatus: GadgetStatus.ACTIVE,
			};
			console.log(search)
		if (gadgetStatus === GadgetStatus.SOLD) soldAt = moment().toDate();
		else if (gadgetStatus === GadgetStatus.DELETE) deletedAt = moment().toDate();

		const result = await this.gadgetModel
			.findOneAndUpdate(search, input, {
				new: true,
			})
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FALED);

		if (soldAt || deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberGadget',
				modifier: -1,
			});
		}
		return result;
	}

	public async removeGadgetByAdmin(gadgetId: ObjectId): Promise<Gadget> {
		const search: T = { _id: gadgetId, gadgetStatus: GadgetStatus.DELETE };
		const result = await this.gadgetModel.findOneAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}


/* // *******************************************************************
	!																			EDITOR 
	* ***********************************************************************/
	public async propertyStatsEditor(input: StatisticModifier): Promise<Gadget> {
		console.log('memberStatsEditor:::');

		const { _id, targetKey, modifier } = input;
		return await this.gadgetModel
			.findByIdAndUpdate(
				_id,
				{ $inc: { [targetKey]: modifier } },
				{
					new: true,
				},
			)
			.exec();
	}


	/* // *******************************************************************
	!																			SHAPEING
	* ***********************************************************************/
	private shapeMatchQuery(match: T, input: GadgetsInquiry): void {
		const {
			memberId,
			locationList,
			capacityList,
			gadgetWeight,
			typeList,
			// periodsRange,
			pricesRange,
			// gadgetDisplaySquare,
			// options,
			text,
		} = input.search;
		if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
		if (locationList && locationList.length) match.gadgetLocation = { $in: locationList };
		if (capacityList && capacityList.length) match.gadgetCapacity = { $in: capacityList };
		if (gadgetWeight && gadgetWeight.length) match.gadgetWeight = { $in: gadgetWeight };
		if (typeList && typeList.length) match.gadgetType = { $in: typeList };

		if (pricesRange) match.gadgetPrice = { $gte: pricesRange.start, $lte: pricesRange.end };
		/* if (periodsRange) match.createdAt = { $gte: periodsRange.start, $lte: periodsRange.end };
		if (gadgetDisplaySquare) match.gadgetDisplaySquare = { $gte: gadgetDisplaySquare.start, $lte: gadgetDisplaySquare.end };
 */
		if (text) match.gadgetTitle = { $regex: new RegExp(text, 'i') };
		/* if (options) {
			match['$or'] = options.map((ele) => {
				return { [ele]: true };
			}); 
			
		}*/
	}

}
