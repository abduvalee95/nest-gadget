import { BadRequestException, ConsoleLogger, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { MeNotificate } from '../../libs/dto/notification/notification';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { Message } from '../../libs/enums/common.enums';
import { NotificationStatus } from '../../libs/enums/notification.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { lookupNotification, lookupNotificationData } from '../../libs/config'
import { NotificationUpdate } from '../../libs/dto/notification/notification.update'

@Injectable()
export class NotificationService {
	logger: any;
	constructor(@InjectModel('Notification') private readonly notificationModel: Model<MeNotificate>) {}

	public async toggleNotification(memberId: ObjectId, input: NotificationInput): Promise<number> {
		const search: T = { memberId: input.memberId, notificationRefId: input.notificationRefId };
		let modifier = 1;

		try {
			// Check if notification already exists
			const existingNotification = await this.notificationModel.findOne(search).exec();

			if (existingNotification) {
				// Update existing notification or perform a toggle logic
				existingNotification.unRead = !existingNotification.unRead; // Example toggle logic
				await existingNotification.save();
				modifier = existingNotification.unRead ? 1 : -1;
			} else {
				// Create a new notification
				await this.notificationModel.create(input);
				modifier = 1;
			}
		} catch (error) {
			this.logger.error('Error in toggleNotification:', error);
			if (error.name === 'ValidationError') {
				throw new BadRequestException(Message.VALIDATION_FAILED);
			}
			throw new InternalServerErrorException(Message.CREATE_FAILED);
		}
		return modifier;
	}

	public async getNotification(memberId: ObjectId,input:String
	): Promise<MeNotificate[]> {
		const match: T = {receiverId:memberId , notificationStatus: NotificationStatus.WAIT };
		// const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };
		const result = await this.notificationModel
		.aggregate([
			{$match: match},
			lookupNotificationData,
		]).exec()
		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		// console.log(JSON.stringify(result,null,5))
		return result
	}

	public async updateNotification(authorId: ObjectId, input: NotificationUpdate): Promise<MeNotificate> {
		const { _id } = input;
		const result = await this.notificationModel.findOneAndUpdate({ _id: _id }, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FALED);
		return result;
	}
	/* // *******************************************************************
																					Stats Editor
	* ***********************************************************************/

	public async notificationStateEditor(input: StatisticModifier): Promise<MeNotificate> {
		console.log('NotificationStatisticEditor');

		const { _id, targetKey, modifier } = input;
		return await this.notificationModel
			.findByIdAndUpdate(
				_id,
				{ $inc: { [targetKey]: modifier } },
				{
					new: true,
				},
			)
			.exec();
	}
}
