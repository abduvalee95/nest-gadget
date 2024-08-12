import { Field, InputType, Int } from '@nestjs/graphql'
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator'
import { NoticeCategory } from '../../enums/notice.enum'
import { ObjectId } from 'mongoose'
import { availableCommentSorts } from '../../config'
import { Direction } from '../../enums/member.enum'

@InputType()
export class CsInput {

	@IsNotEmpty()
	@Field(() =>NoticeCategory )
	noticeCategory: NoticeCategory;

	@IsNotEmpty()
	@Length(1, 100)
	@Field(() => String)
	noticeTitle: string;

	@IsNotEmpty()
	@Field(() => String)
	noticeContent: string;

	memberId?: ObjectId;

}

@InputType()
class CISearch {
	@IsNotEmpty()
	@Field(() => String)
	noticeRefId: ObjectId;
}

@InputType()
export class CsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableCommentSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => CISearch)
	search: CISearch;
}
