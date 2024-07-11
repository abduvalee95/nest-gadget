import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Gadget } from '../../libs/dto/gadget/gadget'
import { Model, ObjectId } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { GadgetInput } from '../../libs/dto/gadget/gadget.input'
import { MemberService } from '../member/member.service'
import { Message } from '../../libs/enums/common.enums'
import { T } from '../../libs/types/common'
import { GadgetStatus } from '../../libs/enums/gadget.enum'
import { ViewGroup } from '../../libs/enums/view.enum'

@Injectable()
export class GadgetService {
	constructor(
		@InjectModel('Gadget') private readonly gadgetModel: Model<Gadget>,
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
				propertyStatus: GadgetStatus.ACTIVE
			};
			const targetProperty = await this.gadgetModel.findOne(search).lean().exec();
			if (!targetProperty) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
	
			// if (memberId) {
			// 	//		kim tomosha qilyabti, mimani tomosha q-ti,
			// 	const viewInput = { memberId: memberId, viewRefId: gadgetId, viewGroup: ViewGroup.GADGET };
			// 	const newView = await this.viewService.recordView(viewInput); // agar record ishga tushub yangi View ni +1 oshiradi
			// 	if (newView) {
			// 		await this.propertyStatsEditor({ _id: propertyId, targetKey: 'propertyViews', modifier: 1 });
			// 		targetProperty.propertyViews++;
			// 	}
			// 	//meLiked
			// 	const likeInput = { memberId: memberId, likeRefId: propertyId, likeGroup: LikeGroup.PROPERTY };
			// 	targetProperty.meLiked = await this.likeService.checkLikeExistance(likeInput);
			// }
			targetProperty.memberData = await this.memberService.getMember(null, targetProperty.memberId);
			return targetProperty;
		}
	
}
