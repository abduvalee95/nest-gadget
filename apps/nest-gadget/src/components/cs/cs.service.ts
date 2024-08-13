import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { match } from 'assert'
import { Model, ObjectId } from 'mongoose'
import { Notice, Notices } from '../../libs/dto/cs/cs'
import { CsInput, NoticesInquiry } from '../../libs/dto/cs/cs.input'
import { Message } from '../../libs/enums/common.enums'
import { Direction } from '../../libs/enums/member.enum'
import { NoticeStatus } from '../../libs/enums/notice.enum'
import { T } from '../../libs/types/common'
import { lookupNotice } from '../../libs/config'

@Injectable()
export class CsService {
	constructor (@InjectModel('Notice') private readonly csModel: Model<Notice>){}


	public async createNotice(memberId: ObjectId, input: CsInput): Promise<Notice> {
		input.memberId = memberId;
		try {
			console.log(memberId);
			const result = await this.csModel.create(input);
			console.log(result);
			return result
			// Comment hosil bolganda Notification hosil qilamiz Serivise iwledi  
		} catch (error) {
			console.log('Error CreateCsServiceModel', error.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async getNotices(input: NoticesInquiry): Promise<Notices> {
		const{noticeRefId} = input.search
		const match: T = {noticeStatus: NoticeStatus.ACTIVE};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };
		console.log("match",match);
	
	const result = await this.csModel
	.aggregate([
		{$match: match},
		{$sort: sort},
		{
			$facet: {
				list: [
					{ $skip: (input.page - 1) * input.limit },
					{ $limit: input.limit },

					// { $unwind: '$memberData' },
				],
				metaCounter: [{ $count: 'total' }],
			},
		},
	])
	.exec();
	if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
	console.log("result",result)
	return result[0] ; 
}

public async removeBoardArticleByAdmin(noticeId: ObjectId): Promise<Notice> {
	const search: T = { _id: noticeId, };
	const result = await this.csModel.findOneAndDelete(search).exec();

	if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
	return result;
}





}