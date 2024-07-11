import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GadgetService } from './gadget.service'
import { Roles } from '../auth/decorators/roles.decorator'
import { MemberType } from '../../libs/enums/member.enum'
import { UseGuards } from '@nestjs/common'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Gadget } from '../../libs/dto/gadget/gadget'
import { GadgetInput } from '../../libs/dto/gadget/gadget.input'
import { ObjectId } from 'mongoose'
import { AuthMember } from '../auth/decorators/authMember.decorator'
import { WithoutGuard } from '../auth/guards/without.guard'
import { shapeIntoMongoObjectId } from '../../libs/config'

@Resolver()
export class GadgetResolver {
	constructor(private readonly gadgetService: GadgetService) {}


	@Roles(MemberType.SELLER)
	@UseGuards(RolesGuard)
	@Mutation(() => Gadget)
	public async createGadget(
		@Args('input') input: GadgetInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Gadget> {
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

}
