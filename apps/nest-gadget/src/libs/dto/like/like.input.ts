import { Field, InputType } from '@nestjs/graphql';
import { IsEmpty, IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongoose';
import { LikeGroup } from '../../enums/like.enum';
import { NotificationGroup } from '../../enums/notification.enum'

@InputType()
export class LikeInput {
	@IsNotEmpty()
	@Field(() => String)
	memberId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	likeRefId: ObjectId;

	@IsNotEmpty()
	@Field(() => LikeGroup)
	likeGroup: LikeGroup;

	@IsEmpty()
	@Field(() => String)
	notificationRefId: ObjectId
	
	@IsEmpty()
	@Field(() => NotificationGroup)
	notificationGroup: NotificationGroup; //Groupni Type 

}
