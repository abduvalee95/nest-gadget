import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Gadget, Gadgets } from '../../libs/dto/gadget/gadget';
import { AllGadgetsInquiry, GadgetInput, GadgetsInquiry, OrdinaryInquiry, SellerGadgetsInquiry, } from '../../libs/dto/gadget/gadget.input';
import { GadgetUpdate } from '../../libs/dto/gadget/gadget.update';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { GadgetService } from './gadget.service';
import { AuthGuard } from '../auth/guards/auth.guard'

@Resolver()
export class GadgetResolver {
	constructor(private readonly gadgetService: GadgetService) {}

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation(() => Gadget)
	public async createGadget(@Args('input') input: GadgetInput, @AuthMember('_id') memberId: ObjectId): Promise<Gadget> {
		console.log('Mutation:> createGadget');
		input.memberId = memberId; //inputdda bosh member id kelsa unga Authni ichidegi memberIdga tenglayabmiz
		return await this.gadgetService.createGadget(input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => Gadget)
	public async getGadget(
		@Args('gadgetId') input: string, //QAysi properylarni malumotni olmoqchimiz
		@AuthMember('_id') memberId: ObjectId, // Agar authenticated bolgan bolsa memberIdni olib beradi aksxolda null keladi
	): Promise<Gadget> {
		console.log('Query:>: getGadget');
		const gadgetId = shapeIntoMongoObjectId(input);
		return await this.gadgetService.getGadget(memberId, gadgetId);
	}

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Gadget)
	public async updateGadget(
		@Args('input') input: GadgetUpdate,
		@AuthMember('_id') memberId: ObjectId, // Agar authenticated bolgan bolsa memberIdni olib beradi aksxolda null keladi
	): Promise<Gadget> {
		console.log('Query:>: UpdateGadget');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.gadgetService.updateGadget(memberId, input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => Gadgets)
	public async getGadgets(
		@Args('input') input: GadgetsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Gadgets> {
		console.log('Query>> getGadgets');
		return await this.gadgetService.getGadgets(memberId, input);
	}

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Query((returns) => Gadgets)
	public async getSellerGadgets(
		@Args('input') input: SellerGadgetsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Gadgets> {
		console.log('Query>> getSellerGadgets');
		return await this.gadgetService.getSellerGadgets(memberId, input);
	} 


	/* // *******************************************************************
	!																			Favorite
	* ***********************************************************************/


	@UseGuards(AuthGuard)
	@Query((returns) => Gadgets)
	public async getFavorites(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Gadgets> {
		console.log('Query>> getFavorites');
		return await this.gadgetService.getFavorites(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Query((returns) => Gadgets)
	public async getVisited(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Gadgets> {
		console.log('Query>> getVisited');
		return await this.gadgetService.getVisited(memberId, input);
	}

	/* // *******************************************************************
	!																			LIKE
	* ***********************************************************************/
	@UseGuards(AuthGuard)
	@Mutation(() => Gadget)
	public async likeTargetGadget(
		@Args('gadgetId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Gadget> {
		console.log('LikeTargetGadget');
		const likeRefId = shapeIntoMongoObjectId(input);
		return await this.gadgetService.likeTargetGadget(memberId, likeRefId);
	}
	
	/* // *******************************************************************
	!																			ADMIN 
	* ***********************************************************************/
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query((returns) => Gadgets)
	public async getAllGadgetsByAdmin(
		@Args('input') input: AllGadgetsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Gadgets> {
		console.log('Query>> getAllGadgetsByAdmin');
		return await this.gadgetService.getAllGadgetsByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Gadget)
	public async updateGadgetByAdmin(@Args('input') input: GadgetUpdate): Promise<Gadget> {
		console.log('Query:>: updateProppertyByAdmin');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.gadgetService.updateGadgetByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Gadget)
	public async removeGadgetByAdmin(
		@Args('gadgetId') input: string, 
	): Promise<Gadget> {
		console.log('Query:>: removeGadgetByADmin');
		const gadgetId = shapeIntoMongoObjectId(input);
		return await this.gadgetService.removeGadgetByAdmin(gadgetId);
	}

}
