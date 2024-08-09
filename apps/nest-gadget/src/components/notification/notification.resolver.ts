import { Args, Query, Resolver } from '@nestjs/graphql';
import { NotificationService } from './notification.service'

import { NotificationInput } from '../../libs/dto/notification/notification.input'
import { AuthMember } from '../auth/decorators/authMember.decorator'
import { ObjectId } from 'mongoose'
import { MeNotificate } from '../../libs/dto/notification/notification'


@Resolver()
export class NotificationResolver {
	constructor( private readonly notificationService: NotificationService) {}

	/* @Query((returns) => MeNotificate)
	public async toggleNotification(
		@Args('input') input: NotificationInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<MeNotificate> {
		console.log('Query:: CreateNotification');
		return await this.notificationService.toggleNotification(memberId,input)
	} */
 

}
