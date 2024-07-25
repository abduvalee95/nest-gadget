import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'
import { Model, ObjectId } from 'mongoose'
import { Like, MeLiked } from '../../libs/dto/like/like'
import { LikeInput } from '../../libs/dto/like/like.input'
import { Message } from '../../libs/enums/common.enums'
import { Gadgets } from '../../libs/dto/gadget/gadget'
import { OrdinaryInquiry } from '../../libs/dto/gadget/gadget.input'
import { LikeGroup } from '../../libs/enums/like.enum'
import { T } from '../../libs/types/common'
import { lookupFavorite } from '../../libs/config'

@Injectable()
export class LikeService {
 constructor(@InjectModel('Like') private readonly likeModel: Model<Like>) {}


	public async toggleLike(input: LikeInput): Promise<number> {
		const search: T = { memberId: input.memberId, likeRefId: input.likeRefId },
			exist = await this.likeModel.findOne(search).exec();

		let modifier = 1;
		if (exist) {
			await this.likeModel.findOneAndDelete(search).exec();
			modifier = -1;
		} else {
			try {
				await this.likeModel.create(input); // bu natijada qoshib beradi
			} catch (error) {
				console.log('Eror LikeTogleService', error.message);
				throw new BadRequestException(Message.CREATE_FAILED);
			}
		}
		return modifier;
	}

	public async checkLikeExistance(input: LikeInput): Promise<MeLiked[]> {
		const { memberId, likeRefId } = input;
		const result = await this.likeModel.findOne({ memberId: memberId, likeRefId: likeRefId }).exec();

		return result ? [{ memberId: memberId, likeRefId: likeRefId, myFavorite: true }] : [];
	}

	public async getFavoriteGadgets(memberId: ObjectId, input: OrdinaryInquiry): Promise<Gadgets> {
		const { page, limit } = input;
		const match: T = { likeGroup: LikeGroup.GADGET, memberId: memberId };
			//jami Propertylargabosigan likeni agrigation orqalik izlamoqda 
		const data: T = await this.likeModel
			.aggregate([
				{ $match: match }, //like loglarni beradi 
				{ $sort: { updatedAt: -1 } },
				{
					$lookup: {
						from: 'gadgets', // shu erdan qidirib "ForeignFielddan " idga teng bolganini izlamoqda
						localField: 'likeRefId', // shu Id larimizni ^
						foreignField: '_id', //^ bihiilni izlemiz 
						as: 'favoriteGadget',
					},
				},
				{ $unwind: '$favoriteGadget' }, //oddiy arrayni ichidan tashqariga chikarib ber deyabmiz
				{
					$facet: {
						//Properties korinishida chikarish  List korinishdahosil qilish
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupFavorite, // favorite propertyni hosil qilgan agentni shakilantirib 
							{ $unwind: '$favoriteGadget.memberData' }, //arraydan hosil qilib ber
						],
						metaCounter:[{$count: 'total'}]
					},
				},
			]) 
			.exec();
			console.log("data>>>",data)

		const result: Gadgets = { list: [], metaCounter: data[0].metaCounter };
		result.list = data[0].list.map((ele) => ele.favoriteGadget); // xarbir logni ichida joylashgannini yahlit tarzda olvoldik : Properties dto ni beradi 
		return result
	}
}
