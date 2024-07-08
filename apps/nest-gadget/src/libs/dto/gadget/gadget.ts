import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { Member, TotalCounter } from '../member/member';
// import { MeLiked } from '../like/like';
import { GadgetLocation, GadgetStatus, GadgetType } from '../../enums/gadget.enum'

@ObjectType()
export class Gadget {
	@Field(() => String) // JS ni Typlari
	_id: ObjectId;

	@Field(() => GadgetType)
	gadgetType: GadgetType;

	@Field(() => GadgetStatus)
	gadgetStatus: GadgetStatus;

	@Field(() => GadgetLocation) //Bur datadan kelayotgan typelar
	gadgetLocation: GadgetLocation;

	@Field(() => String)
	gadgetAddress: String;

	@Field(() => String)
	gadgetTitle: string;

	@Field(() => Number)
	gadgetPrice: number;

	@Field(() => Number)
	gadgetSquare: number;

	@Field(() => Int)
	gadgetBeds: number;

	@Field(() => Int)
	gadgetRooms: number;

	@Field(() => Int)
	gadgetViews: number;

	@Field(() => Int)
	gadgetLikes: number;

	@Field(() => Int)
	gadgetComments: number;

	@Field(() => Int)
	gadgetRank: number;

	@Field(() => [String])
	gadgetImages: string[];

	@Field(() => String, { nullable: true })
	gadgetDesc?: string;

	@Field(() => Boolean)
	gadgetBarter: boolean;

	@Field(() => Boolean)
	gadgetRent: boolean;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => Date, { nullable: true })
	soldAt?: Date;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date, { nullable: true })
	constructedAt?: Date;

	@Field(() => Date)
	createdAt?: Date;

	@Field(() => Date)
	updatedAt?: Date;

	//** From Agregation */

	@Field(() => Member, { nullable: true }) // xosil qilgan agentni memberDatasni  kiriyyabmiz
	memberData?: Member;

/* 	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[]; */
}

@ObjectType()
export class Gadgets {
	@Field(() => [Gadget])
	list: Gadget[]; // list esa ozida bir qator arrayni tashkil qiladii

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
