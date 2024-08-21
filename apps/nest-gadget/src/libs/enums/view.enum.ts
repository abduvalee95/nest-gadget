import { registerEnumType } from '@nestjs/graphql';

export enum ViewGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	GADGET = 'GADGET',
	FAQ = 'FAQ',
}
registerEnumType(ViewGroup, {
	name: 'ViewGroup',
});
