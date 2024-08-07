import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Gadget } from 'apps/nest-gadget/src/libs/dto/gadget/gadget'
import { Member } from 'apps/nest-gadget/src/libs/dto/member/member'
import { GadgetStatus } from 'apps/nest-gadget/src/libs/enums/gadget.enum'
import { MemberStatus, MemberType } from 'apps/nest-gadget/src/libs/enums/member.enum'
import { Model } from 'mongoose';

@Injectable()
export class BatchService {
	constructor(
		@InjectModel('Gadget') private readonly gadgetModel: Model<Gadget>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}

	public async batchRollback(): Promise<void> {
		console.log('batch_rolleBack');

		await this.gadgetModel
			.updateMany(
				{ gadgetStatus: GadgetStatus.ACTIVE }, // filter qilib
				{ gadgetRank: 0 }, // hammasni rankni 0ga tenglashga majbur qilyabmiz
			)
			.exec();

		await this.memberModel
			.updateMany(
				{
					memberStatus: MemberStatus.ACTIVE,
					memberType: MemberType.AGENT,
				},
				{ memberRank: 0 },
			)
			.exec();
	}

	public async batchTopProperties(): Promise<void> {
		console.log('batch_Properties');

		const properties: Gadget[] = await this.gadgetModel
			.find({
				gadgetStatus: GadgetStatus.ACTIVE,
				gadgetRank: 0,
			})
			.exec();

		const promisedList = properties.map(async (ele: Gadget) => {
			// xar bita propertylarimizni qolga olib olyabmiz
			const { _id,  gadgetLikes,  gadgetViews } = ele;
			const rank = gadgetLikes * 2 + gadgetViews * 1; //qonuniyat hosil qilib olyabmiz
			return await this.gadgetModel.findByIdAndUpdate(_id, { propertyRank: rank });
		});
		await Promise.all(promisedList);
	}

	public async batchTopAgents(): Promise<void> {
    console.log('batch_Agents');
    const agents: Member[] = await this.memberModel
      .find({
        memberType: MemberType.AGENT,
        memberStatus: MemberStatus.ACTIVE,
        memberRank: 0
      })
      .exec();
    const promisedList = agents.map(async (ele: Member) => {
      const { _id, memberGadgets, memberLikes, memberArticles, memberViews } = ele;
      const rank = memberGadgets * 5 + memberLikes * 4 + memberArticles * 3 + memberViews * 1;
      return await this.memberModel.findOneAndUpdate(_id, { memberRank: rank });
    });
    await Promise.all(promisedList) // promisedList PendingObject  ularni harbrini toliq ishga tushishini taminlab beradigon mantiq bu;
	}
	// Api
	getHello(): string {
		return 'Welcome to Nestar Batch Server';
	}
}
