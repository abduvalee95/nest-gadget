import { Field, ObjectType } from '@nestjs/graphql'
import { ObjectId } from 'mongoose'
import { NotificationGroup, NotificationStatus } from '../../enums/notification.enum'
import { Member, TotalCounter } from '../member/member' 

@ObjectType()
export class MeNotificate {
	@Field(()=> String)
	memberId: ObjectId; // kim uchun bosilyabti hosil bolgan 

	@Field(()=> String)
	notificationRefId: ObjectId //qaysi groupga ketyabti poduct

	@Field(() => Boolean)
	unRead: boolean;

	@Field(() => NotificationStatus)
	notificationStatus: NotificationStatus;

	@Field(() => NotificationGroup) // type 
	notificationGroup: NotificationGroup;

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
	
	/** from aggregation **/

	@Field(() => Member, { nullable: true })
	memberData?: Member;
}



@ObjectType()
export class Notifications {
	@Field(() => [MeNotificate])
	list: MeNotificate[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
