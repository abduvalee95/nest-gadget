import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { lookupVisit } from '../../libs/config';
import { Gadgets } from '../../libs/dto/gadget/gadget';
import { OrdinaryInquiry } from '../../libs/dto/gadget/gadget.input';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { T } from '../../libs/types/common';

@Injectable()
export class ViewService {
	constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

	public async recordView(input: ViewInput): Promise<View | null> {
		const viewExist = await this.checkViewExistence(input);
		//agar view bolsa viewni qaytaradi + oshiradi aksholda yangi view hosil qilma deymiz
		if (!viewExist) {
			console.log('+++++New View Inserted++++++++');
			return await this.viewModel.create(input);
		} else return null;
	}

	// Authenticate bolgan member Target ni koryatganini tekshiramiz
	private async checkViewExistence(input: ViewInput): Promise<View> {
		const { memberId, viewRefId } = input;
		const search: T = {
			memberId: memberId,
			viewRefId: viewRefId,
		};
		return await this.viewModel.findOne(search).exec();
	}

	public async getVisitedGadgets(memberId: ObjectId, input: OrdinaryInquiry): Promise<Gadgets> {
		const { page, limit } = input;
		const match: T = { viewGroup: ViewGroup.GADGET, memberId: memberId };
		//jami Propertylargabosigan likeni agrigation orqalik izlamoqda
		const data: T = await this.viewModel
			.aggregate([
				{ $match: match }, //like loglarni beradi
				{ $sort: { updatedAt: -1 } }, //oxirgi korganlarimizni Sort qilyabmiz
				{
					$lookup: {
						from: 'gadgets', // shu erdan qidirib "ForeignFielddan " idga teng bolganini izlamoqda
						localField: 'viewRefId', // shu Id larimizni ^
						foreignField: '_id', //^ bihiilni izlemiz
						as: 'visitedGadget',
					},
				},
				{ $unwind: '$visitedGadget' }, //oddiy arrayni ichidan tashqariga chikarib ber deyabmiz
				{
					$facet: {
						//Properties korinishida chikarish  List korinishdahosil qilish
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupVisit, // favorite propertyni hosil qilgan agentni shakilantirib
							{ $unwind: '$visitedGadget.memberData' }, //arraydan hosil qilib ber
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		const result: Gadgets = { list: [], metaCounter: data[0].metaCounter };
		result.list = data[0].list.map((ele) => ele.visitedGadget); // xarbir logni ichida joylashgannini yahlit tarzda olvoldik : Properties dto ni beradi
		return result;
	}
}
