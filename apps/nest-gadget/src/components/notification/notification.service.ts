import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { MeNotificate} from '../../libs/dto/notification/notification';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { Message } from '../../libs/enums/common.enums';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../libs/enums/notification.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { OrdinaryInquiry } from '../../libs/dto/gadget/gadget.input'

@Injectable()
export class NotificationService {
	logger: any
	constructor(@InjectModel('Notification') private readonly notificationModel:  Model<MeNotificate>) {}

	public async toggleNotification(memberId:ObjectId ,input: NotificationInput ): Promise<number> {
	/* 	const search: T = { memberId:input.memberId, notificationRefId: input.notificationRefId };
		memberId = input.memberId
		// exist = await this.notificationModel.findOne(search).exec();
		let modifier = 1
		try {
			console.log("here")
		 	await this.notificationModel.create(input);
			modifier ++
		} catch (error) {
			console.log('Error CreateNotificationServiceModel', error.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		} */
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
/* 
	public async getNotification(receiverId: ObjectId, input: OrdinaryInquiry): Promise<Notificate> {
		const { page, limit } = input;
		const match: T = { notificationStatus: NotificationStatus.WAIT, memberId: memberId, }; 
			//jami Propertylargabosigan notificationni agrigation orqalik izlamoqda 
		const data: T = await this.notificationModel //not olindi 
			.aggregate([
				{ $match: match }, //notification loglarni beradi 
				{ $sort: { updatedAt: -1 } },
				{
					$lookup: {
						from: 'members', // shu erdan qidirib "ForeignFielddan " idga teng bolganini izlamoqda
						localField: 'notificationRefId', // shu Id larimizni ^
						foreignField: '_id', //^ bihiilni izlemiz 
						as: 'notificationGadget',
					},
				{ $unwind: '$notificationGadget' }, //oddiy arrayni ichidan tashqariga chikarib ber deyabmiz
				
					$lookup: {
						from: 'gadgets', // shu erdan qidirib "ForeignFielddan " idga teng bolganini izlamoqda
						localField: 'notificationRefId', // shu Id larimizni ^
						foreignField: '_id', //^ bihiilni izlemiz 
						as: 'notificationGadget',
					},
				},
				{ $unwind: '$notificationGadget' }, //oddiy arrayni ichidan tashqariga chikarib ber deyabmiz
				{
					$facet: {
						//Properties korinishida chikarish  List korinishdahosil qilish
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupNotification, // notification propertyni hosil qilgan agentni shakilantirib 
							{ $unwind: '$notificationGadget.memberData' }, //arraydan hosil qilib ber
						],
						metaCounter:[{$count: 'total'}]
					},
				},
			]) 
			.exec();
			console.log("data>>>",data)

		const result: Gadgets = { list: [], metaCounter: data[0].metaCounter };
		result.list = data[0].list.map((ele) => ele.notificationGadget); // xarbir logni ichida joylashgannini yahlit tarzda olvoldik : Properties dto ni beradi 
		return result
	}
 */


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