import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { Direction, MemberAuthType, MemberStatus, MemberType } from '../../enums/member.enum';
import { Optional } from '@nestjs/common';
// import { availbleAgentSorts, availbleMemberSorts } from '../../config';

@InputType()
export class MemberInput {
	//Memberni Inputni - DTO qurilishi

	@IsNotEmpty()
	@Length(3, 12)
	@Field(() => String)
	memberNick: string;

	@IsNotEmpty()
	@Field(() => String)
	memberPhone: string;

	@IsNotEmpty()
	@Length(5, 12)
	@Field(() => String)
	memberPassword: string;

	@IsOptional()
	@Field(() => MemberType, { nullable: true })
	memberType?: MemberType;

	@IsOptional()
	@Field(() => MemberAuthType, { nullable: true })
	memberAuthType?: MemberAuthType;
}

@InputType()
export class LoginInput {
	//Login Inputni - DTO qurilishi

	@IsNotEmpty()
	@Length(3, 12)
	@Field(() => String)
	memberNick: string;

	@IsNotEmpty()
	@Length(5, 12)
	@Field(() => String)
	memberPassword: string;
}

@InputType()
//agentlarni Nomlari bn izledi
class AISearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class AgentsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number; // qaysi pageni olyabmiz

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number; // Xar bir pageda nechtadan Agent bolishi kk

	// @IsOptional()
	// @IsIn(availbleAgentSorts) // Bu faqat shu arraydegilarni qabul qiladi degani
	@Field(() => String, { nullable: true })
	sort?: string; // Sort qanqa bolish kk oxirgi, yoki yangi & likelari kop ...

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction; // yuqoridan pastga Oxirgi qoshilganlari yoki yangilari ni manipulate qilish mm

	@IsNotEmpty()
	@Field(() => AISearch)
	search: AISearch;
}

@InputType()
class MISearch {
	@IsOptional()
	@Field(() => MemberStatus, { nullable: true })
	memberStatus?: MemberStatus; // Admin Xar qanday memberlarni chaqira oledi Block Deleted Active

	@IsOptional()
	@Field(() => MemberType, { nullable: true })
	memberType?: MemberType; // Agent,User,Xoxlaganimizni Search qilish uchun 

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class MembersInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number; // qaysi pageni olyabmiz

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number; // Xar bir pageda nechtadan Agent bolishi kk

	// @IsOptional()
	// @IsIn(availbleMemberSorts) // Bu faqat shu arraydegilarni qabul qiladi degani
	@Field(() => String, { nullable: true })
	sort?: string; // Sort qanqa bolish kk oxirgi, yoki yangi & likelari kop ...

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction; // yuqoridan pastga Oxirgi qoshilganlari yoki yangilari ni manipulate qilish mm

	@IsNotEmpty()
	@Field(() => MISearch)
	search: MISearch; // spesefic talab etilgan qiymat bolgani uchun tashqariga yozib chaqiryabmiz buyoqa 
}
