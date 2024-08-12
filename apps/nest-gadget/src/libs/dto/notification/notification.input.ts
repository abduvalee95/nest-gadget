import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { NotificationGroup, NotificationType } from '../../enums/notification.enum';
import { ObjectId } from 'mongoose'
import { LikeGroup } from '../../enums/like.enum'

@InputType()
export class NotificationInput {

	// @IsNotEmpty()
	@Field(() => String, { nullable : true})
	notificationTitle: string;

	// @IsNotEmpty()
	@Field(() => String, { nullable : true})
	notificationDesc: string;

	@IsNotEmpty()
	@Field(() => String)
	memberId: ObjectId;

	// @IsNotEmpty()
	@Field(() => String)
	notificationRefId: ObjectId
	
	// @IsNotEmpty()
	@Field(() => NotificationGroup , { nullable : true})
	notificationGroup: NotificationGroup; //Groupni Type 

	// @IsNotEmpty()
	@Field(() => NotificationType, { nullable : true})
	notificationType: NotificationType; //Groupni Type 

	// @IsNotEmpty()
	@Field(() => String, { nullable : true})
	likeRefId: ObjectId;

	// @IsNotEmpty()
	@Field(() => LikeGroup, { nullable : true})
	likeGroup: LikeGroup;


	@Field(() => String)
	authorId: ObjectId;

	@Field(() => String)
	receiverId: ObjectId;

	@Field(() => String)
	gadgetId: ObjectId;

	@Field(() => String)
	articleId: ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
