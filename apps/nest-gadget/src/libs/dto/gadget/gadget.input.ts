//! dto -- Data Transfer Object
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { availableOptions, availableGadgetSorts } from '../../config';
import { Direction } from '../../enums/member.enum';
import { GadgetLocation, GadgetStatus, GadgetType } from '../../enums/gadget.enum'

// Fronend dan Backendga argument sifatidda pass qilamiz

@InputType()
export class GadgetInput {
	@IsNotEmpty()
	@Length(3, 12)
	@Field(() => GadgetType)
	gadgetType: GadgetType;

	@IsNotEmpty()
	@Field(() => GadgetLocation)
	gadgetLocation: GadgetLocation;

	@IsNotEmpty()
	@Length(3, 50)
	@Field(() => String)
	gadgetColor: string;

	@IsNotEmpty()
	@Length(3, 50)
	@Field(() => String)
	gadgetTitle: string;

	@IsNotEmpty()
	@Field(() => Number)
	gadgetPrice: number;

	@IsOptional()
	@Field(() => Number)
	gadgetDisplaySquare: number;

	@IsOptional()
	@IsInt()
	@Min(1)
	@Field(() => Int)
	gadgetWeight: number;

	@IsNotEmpty()
	@IsInt()
	@Min(1)
	@Field(() => Int)
	gadgetCapacity: number;

	@IsNotEmpty()
	@Field(() => [String])
	gadgetImages: string[];

	@IsOptional()
	@Length(3, 200)
	@Field(() => String, { nullable: true })
	gadgetDesc?: string;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	propertyBarter?: boolean;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	propertyRent?: boolean;

	//! Typelarimiz crash bolmasligi uchun ,  buning qiymatni request qilyatgan membernij Authenticationdan qabul qilamiz
	memberId?: ObjectId; // Frontendan bu malumotni yuboirilsa agent boshqa agenti  idsdan foydalansaham b0oladi

	@IsOptional()
	@Field(() => Date, { nullable: true })
	constructedAt?: Date;
}

@InputType()
export class PriceRange {
	@Field(() => Int)
	start: number;

	@Field(() => Int)
	end: number;
}

@InputType()
export class SquaresRange {
	@Field(() => Int)
	start: number;

	@Field(() => Int)
	end: number;
}

@InputType()
export class PeriodsRange {
	@Field(() => Int)
	start: number;

	@Field(() => Int)
	end: number;
}

@InputType()
class PISearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: ObjectId;

	@IsOptional()
	@Field(() => [GadgetLocation], { nullable: true })
	locationList?: GadgetLocation[];

	@IsOptional()
	@Field(() => [GadgetType], { nullable: true })
	typeList?: GadgetType[];

	@IsOptional()
	@Field(() => [Int], { nullable: true })
	gadgetCapacityList?: Number[];

	@IsOptional()
	@Field(() => [Int], { nullable: true })
	gadgetWeight?: Number[];

	@IsOptional()
	@IsIn(availableOptions, { each: true })
	@Field(() => [String], { nullable: true })
	options?: string[];

	@IsOptional()
	@Field(() => PriceRange, { nullable: true })
	pricesRange?: PriceRange;

	@IsOptional()
	@Field(() => SquaresRange, { nullable: true })
	gadgetDisplaySquare?: SquaresRange;

	@IsOptional()
	@Field(() => PeriodsRange, { nullable: true })
	periodsRange?: PeriodsRange;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class GadgetsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number; // qaysi pageni olyabmiz

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number; // Xar bir pageda nechtadan Agent bolishi kk

	@IsOptional()
	@IsIn(availableGadgetSorts)
	@Field(() => String, { nullable: true })
	sort?: string; // Sort qanqa bolish kk oxirgi, yoki yangi & likelari kop ...

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction; // yuqoridan pastga Oxirgi qoshilganlari yoki yangilari ni manipulate qilish mm

	@IsNotEmpty()
	@Field(() => PISearch)
	search: PISearch;
}

@InputType()
class APISearch {
	@IsOptional()
	@Field(() => GadgetStatus, { nullable: true })
	gadgetStatus?: GadgetStatus;
}

@InputType()
export class SellerGadgretsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number; // qaysi pageni olyabmiz

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number; // Xar bir pageda nechtadan Agent bolishi kk

	@IsOptional()
	@IsIn(availableGadgetSorts)
	@Field(() => String, { nullable: true })
	sort?: string; // Sort qanqa bolish kk oxirgi, yoki yangi & likelari kop ...

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction; // yuqoridan pastga Oxirgi qoshilganlari yoki yangilari ni manipulate qilish mm

	@IsNotEmpty()
	@Field(() => APISearch)
	search: APISearch;
}

@InputType()
class ALPISearch {
	@IsOptional()
	@Field(() => GadgetStatus, { nullable: true })
	gadgetStatus?: GadgetStatus; // Afmin Turlik hil statusdegi propertylarni ,korishiga imkon beramiz

	@IsOptional()
	@Field(() => [GadgetLocation], { nullable: true })
	gadgetLocationList?: GadgetLocation[]; // admin da locationga qarab turlik hilarni chikarishni belgiladik
}

@InputType()
export class AllGadgetsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number; // qaysi pageni olyabmiz

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number; // Xar bir pageda nechtadan Agent bolishi kk

	@IsOptional()
	@IsIn(availableGadgetSorts)
	@Field(() => String, { nullable: true })
	sort?: string; // Sort qanqa bolish kk oxirgi, yoki yangi & likelari kop ...

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction; // yuqoridan pastga Oxirgi qoshilganlari yoki yangilari ni manipulate qilish mm

	@IsNotEmpty()
	@Field(() => ALPISearch)
	search: ALPISearch;
}

@InputType()
export class OrdinaryInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number; // qaysi pageni olyabmiz

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number; // Xar bir pageda nechtadan Agent bolishi kk
}
