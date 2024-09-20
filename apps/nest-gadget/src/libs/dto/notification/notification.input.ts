import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { NotificationGroup, NotificationType } from '../../enums/notification.enum';
import { ObjectId } from 'mongoose'
import { LikeGroup } from '../../enums/like.enum'

@InputType()
export class NotificationInput {

	@IsNotEmpty()
	@Field(() => String, { nullable : true})
	notificationTitle: string;

	@IsNotEmpty()
	@Field(() => String, { nullable : true})
	notificationDesc: string;
	
	@IsNotEmpty()
	@Field(() => NotificationGroup , { nullable : true})
	notificationGroup: NotificationGroup; //Groupni Type 
	
	// @IsNotEmpty()
	@IsOptional()
	@Field(() => NotificationType, { nullable : true})
	notificationType: NotificationType; //Groupni Type 
	
	@Field(() => String, { nullable: true })
	messageId?: ObjectId;
	
	@IsOptional()
	@Field(() => String, { nullable : true})
	authorId: ObjectId;
	
	@IsOptional()
	@Field(() => String, { nullable : true})
	receiverId: ObjectId;
	
	@IsOptional()
	@Field(() => String, { nullable : true})
	gadgetId?: ObjectId;
	
	@IsOptional()
	@Field(() => String, { nullable : true})
	articleId?: ObjectId;
}
