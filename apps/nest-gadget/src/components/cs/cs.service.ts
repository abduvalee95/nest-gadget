import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'
import { Model, ObjectId } from 'mongoose'
import { Notice } from '../../libs/dto/cs/cs'
import { CsInput } from '../../libs/dto/cs/cs.input'
import { Message } from '../../libs/enums/common.enums'

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
}