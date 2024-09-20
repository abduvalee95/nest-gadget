import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { MessageStatus } from '../../enums/message.enum'

@InputType()
export class MessageUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: string;

	@IsOptional()
	@Field(() => MessageStatus, { nullable: true })
	notificationStatus?: MessageStatus;
}