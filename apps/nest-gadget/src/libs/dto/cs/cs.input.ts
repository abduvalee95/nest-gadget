import { Field, InputType, Int } from '@nestjs/graphql'
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator'
import { NoticeCategory } from '../../enums/notice.enum'
import { ObjectId } from 'mongoose'
import { availableBoardArticleSorts, availableCommentSorts } from '../../config'
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
class CsISearch {
	@IsOptional()
	@Field(() => NoticeCategory,{nullable: true})
	noticeCategory: NoticeCategory;
}

@InputType()
export class NoticesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableBoardArticleSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => CsISearch)
	search: CsISearch;
}

