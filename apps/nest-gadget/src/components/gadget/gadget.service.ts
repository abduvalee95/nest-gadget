import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Gadget, Gadgets } from '../../libs/dto/gadget/gadget'
import { Model, ObjectId } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { GadgetInput, GadgetsInquiry } from '../../libs/dto/gadget/gadget.input'
import { MemberService } from '../member/member.service'
import { Message } from '../../libs/enums/common.enums'
import { StatisticModifier, T } from '../../libs/types/common'
import { GadgetStatus } from '../../libs/enums/gadget.enum'
import { ViewGroup } from '../../libs/enums/view.enum'
import { ViewService } from '../view/view.service'
import { GadgetUpdate } from '../../libs/dto/gadget/gadget.update'
import moment from 'moment'
import { Direction } from '../../libs/enums/member.enum'
import { lookupMember, shapeIntoMongoObjectId } from '../../libs/config'

@Injectable()
export class GadgetService {
	constructor(
		@InjectModel('Gadget') private readonly gadgetModel: Model<Gadget>,
		private viewService: ViewService,
		private memberService: MemberService,
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
				// const likeInput = { memberId: memberId, likeRefId: propertyId, likeGroup: LikeGroup.PROPERTY };
				// targetProperty.meLiked = await this.likeService.checkLikeExistance(likeInput);
			}
			targetGadget.memberData = await this.memberService.getMember(null, targetGadget.memberId);
			return targetGadget;
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
/* 		this.shapeMatchQuery(match, input); // complex logic bolgani uchuun aloxidayozdik
		console.log(match);
 */
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
							// lookupAuthMemberLiked(memberId),
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


	private shapeMatchQuery(match: T, input: GadgetsInquiry): void {
		const {
			memberId,
			locationList,
			gadgetCapacityList,
			gadgetWeight,
			typeList,
			periodsRange,
			pricesRange,
			gadgetDisplaySquare,
			options,
			text,
		} = input.search;
		if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
		if (locationList && locationList.length) match.gadgetLocation = { $in: locationList };
		if (gadgetCapacityList && gadgetCapacityList.length) match.gadgetCapacity = { $in: gadgetCapacityList };
		if (gadgetWeight && gadgetWeight.length) match.gadgetWeight = { $in: gadgetWeight };
		if (typeList && typeList.length) match.gadgetType = { $in: typeList };

		if (pricesRange) match.gadgetPrice = { $gte: pricesRange.start, $lte: pricesRange.end };
		if (periodsRange) match.createdAt = { $gte: periodsRange.start, $lte: periodsRange.end };
		if (gadgetDisplaySquare) match.gadgetDisplaySquare = { $gte: gadgetDisplaySquare.start, $lte: gadgetDisplaySquare.end };

		if (text) match.gadgetTitle = { $regex: new RegExp(text, 'i') };
		if (options) {
			match['$or'] = options.map((ele) => {
				return { [ele]: true };
			});
			
		}
	}

}
