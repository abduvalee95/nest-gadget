import { registerEnumType } from '@nestjs/graphql';

export enum ViewGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	GADGET = 'GADGET',
}
registerEnumType(ViewGroup, {
	name: 'ViewGroup',
});
