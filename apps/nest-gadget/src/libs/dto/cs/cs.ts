import { Field, ObjectType } from '@nestjs/graphql'
import { ObjectId } from 'mongoose'
import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum'
import { Member, TotalCounter } from '../member/member'

@ObjectType()
export class Notice {

	@Field(() => NoticeCategory)
	noticeCategory: NoticeCategory;

	@Field(() => NoticeStatus)
	noticeStatus: NoticeStatus.ACTIVE;

	@Field(() => String)
	noticeTitle: string;

	@Field(() => String)
	noticeContent: ObjectId;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	/** from aggregation **/

	@Field(() => Member, { nullable: true })
	memberData?: Member;
}

@ObjectType()
export class Notices {
	@Field(() => [Notice])
	list: Notice[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
