import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { NotificationGroup, NotificationType } from '../../enums/notification.enum';
import { ObjectId } from 'mongoose'
import { LikeGroup } from '../../enums/like.enum'

@InputType()
export class NotificationInput {

	@IsOptional()
	@Field(() => String, { nullable : true})
	notificationTitle: string;

	// @IsNotEmpty()
	@IsOptional()
	@Field(() => String, { nullable : true})
	notificationDesc: string;

	@IsOptional()
	@Field(() => String, { nullable : true})
	memberId: ObjectId;

	// @IsNotEmpty()
	@IsOptional()
	@Field(() => String, { nullable : true})
	notificationRefId: ObjectId
	
	// @IsNotEmpty()
	@IsOptional()
	@Field(() => NotificationGroup , { nullable : true})
	notificationGroup: NotificationGroup; //Groupni Type 

	// @IsNotEmpty()
	@IsOptional()
	@Field(() => NotificationType, { nullable : true})
	notificationType: NotificationType; //Groupni Type 

	// @IsNotEmpty()
	@IsOptional()
	@Field(() => String, { nullable : true})
	likeRefId: ObjectId;

	// @IsNotEmpty()
	@IsOptional()
	@Field(() => LikeGroup, { nullable : true})
	likeGroup: LikeGroup;

	@IsOptional()
	@Field(() => String, { nullable : true})
	authorId: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable : true})
	receiverId: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable : true})
	gadgetId: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable : true})
	articleId: ObjectId;

	@IsOptional()
	@Field(() => Date, { nullable : true})
	createdAt: Date;

	@IsOptional()
	@Field(() => Date, { nullable : true})
	updatedAt: Date;
}
