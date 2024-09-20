import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';

@ObjectType()
export class Notification {
	@Field(() => String, { nullable: true })
	_id: ObjectId;

	@Field(() => NotificationType)
	notificationType: NotificationType;

	@Field(() => NotificationStatus, { nullable: true })
	notificationStatus: NotificationStatus;

	@Field(() => NotificationGroup, { nullable: true }) // type
	notificationGroup: NotificationGroup;

	@Field(() => String)
	notificationTitle: string;

	@Field(() => String)
	notificationDesc: string;

	@Field(() => String)
	authorId: ObjectId;

	@Field(() => String)
	receiverId: ObjectId;

	@Field(() => String, { nullable: true })
	messageId?: ObjectId;

	@Field(() => String, { nullable: true })
	gadgetId?: ObjectId;

	@Field(() => String, { nullable: true })
	articleId?: ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
