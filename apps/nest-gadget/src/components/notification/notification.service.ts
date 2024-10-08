import {Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { Message } from '../../libs/enums/common.enums';
import { NotificationStatus } from '../../libs/enums/notification.enum';
import { NotificationUpdate } from '../../libs/dto/notification/notification.update'
import { Member } from '../../libs/dto/member/member'
import { T } from '../../libs/types/common'
import { Notification } from '../../libs/dto/notification/notification'

@Injectable()
export class NotificationService {
	logger: any;
	constructor(@InjectModel('Notification') private readonly notificationModel: Model<Notification>,
	@InjectModel('Member') private readonly memberModel:Model<Member>
) {}

	public async createNotification(memberId: ObjectId, input: NotificationInput): Promise<Notification> {
		try {
			const member = await this.memberModel.findById(memberId).exec();
			const result = await this.notificationModel.create(input);
			return result;
		} catch (err) {
			console.error(err);
			throw new Error('Failed to create notification');
		}
	}

	public async getNotification(memberId: ObjectId,notificationId: ObjectId
	): Promise<Notification> {
		const search: T = {
			_id: notificationId,
			notificationStatus: NotificationStatus.WAIT,
		};
		const notification = await this.notificationModel.findOne(search).exec();
		if (!notification) {
			throw new NotFoundException('Notification not found');
		}
		console.log("get", notification)
		return notification;
	}

	async getNotifications(receiverId: ObjectId): Promise<Notification[]> {
		console.log("here")
		try {
			return await this.notificationModel.find({ receiverId: receiverId }).exec();

		} catch (error) {
			throw new InternalServerErrorException('Failed to get notifications');
		}
	}

	public async updateNotification(authorId: ObjectId, input: NotificationUpdate): Promise<Notification> {
		const { _id } = input;
		const result = await this.notificationModel.findOneAndUpdate({ _id: _id }, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FALED);
		return result;
	}
}
