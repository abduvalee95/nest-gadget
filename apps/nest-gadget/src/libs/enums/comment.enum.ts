import { registerEnumType } from '@nestjs/graphql';

export enum CommentStatus {
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}
registerEnumType(CommentStatus, {
	name: 'CommentStatus',
});

export enum CommentGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	GADGET = 'GADGET',
	BOARD_ARTICLE = "BOARD_ARTICLE",
}
registerEnumType(CommentGroup, {
	name: 'CommentGroup',
});
