import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NotificationService } from './notification.service'

import { NotificationInput } from '../../libs/dto/notification/notification.input'
import { AuthMember } from '../auth/decorators/authMember.decorator'
import { ObjectId } from 'mongoose'
import { MeNotificate } from '../../libs/dto/notification/notification'
import { shapeIntoMongoObjectId } from '../../libs/config'
import { UseGuards } from '@nestjs/common'
import { RolesGuard } from '../auth/guards/roles.guard'
import { AuthGuard } from '../auth/guards/auth.guard'
import { NotificationUpdate } from '../../libs/dto/notification/notification.update'


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

	@UseGuards(AuthGuard)
 @Query((returns) => [MeNotificate])
 public async getNotification(
	@Args('input') input: String ,
  @AuthMember('_id') memberId: ObjectId,
):Promise<MeNotificate[]>{
	console.log("id", memberId)
	console.log("Query: getNotification")
	// input = shapeIntoMongoObjectId(input)
	return await this.notificationService.getNotification(memberId,input)
 }


 @UseGuards(AuthGuard)
 @Mutation(() => MeNotificate)
 public async updateNotification(
	 @Args('input') input: NotificationUpdate,
	 @AuthMember('_id') authorId: ObjectId,
 ): Promise<MeNotificate> {
	 console.log('Mutation: updateNotification');
	 input._id = shapeIntoMongoObjectId(input._id);
	 return await this.notificationService.updateNotification(authorId, input);
 }


}
