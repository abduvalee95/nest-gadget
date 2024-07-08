import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { GadgetLocation, GadgetStatus, GadgetType } from '../../enums/gadget.enum';

@InputType()
export class GadgetUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => GadgetType, { nullable: true })
	gadgetType?: GadgetType;

	@IsOptional()
	@Field(() => GadgetStatus, { nullable: true })
	gadgetStatus?: GadgetStatus;

	@IsOptional()
	@Field(() => GadgetLocation, { nullable: true })
	gadgetLocation?: GadgetLocation;

	@IsOptional()
	@Length(3, 50)
	@Field(() => String, { nullable: true })
	gadgetColor?: string;

	@IsOptional()
	@Length(3, 50)
	@Field(() => String, { nullable: true })
	gadgetTitle?: string;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	gadgetPrice?: number;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	gadgetSize?: number;

	@IsOptional()
	@IsInt()
	@Min(1)
	@Field(() => Int, { nullable: true })
	gadgetWeight?: number;

	@IsOptional()
	@IsInt()
	@Min(1)
	@Field(() => Int, { nullable: true })
	gadgetCapacity?: number;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	gadgetImages?: string[];

	@IsOptional()
	@Length(3, 50)
	@Field(() => String, { nullable: true })
	gadgetDesc?: string;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	gadgetBarter?: boolean;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	gadgetRent?: boolean;

	soldAt?: Date;

	deletedAt?: Date;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	constructedAt?: Date;
}
