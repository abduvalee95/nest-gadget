import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { NotificationGroup, NotificationStatus } from '../../enums/notification.enum';
import { Member, TotalCounter } from '../member/member';

@ObjectType()
export class MeNotificate {

	@Field(() => String, { nullable: true })
	memberId: ObjectId; // kim uchun bosilyabti hosil bolgan

	@Field(() => String, { nullable: true })
	notificationRefId: ObjectId; //qaysi groupga ketyabti poduct

	@Field(() => Boolean, { nullable: true })
	unRead: boolean;

	@Field(() => NotificationStatus, { nullable: true })
	notificationStatus: NotificationStatus;

	@Field(() => NotificationGroup, { nullable: true }) // type
	notificationGroup: NotificationGroup;

	@Field(() => String, { nullable: true })
	authorId: ObjectId;

	@Field(() => String, { nullable: true })
	receiverId: ObjectId;

	@Field(() => String, { nullable: true })
	gadgetId: ObjectId;

	@Field(() => String, { nullable: true })
	articleId: ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}


