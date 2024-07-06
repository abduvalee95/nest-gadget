import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../../schemas/Member.model';
import { MemberResolver } from './member.resolver';
import { MemberService } from './member.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Member',
				schema: MemberSchema,
			},
		]),
	],
	providers: [MemberService, MemberResolver],
})
export class MemberModule {}
