import { registerEnumType } from '@nestjs/graphql';

export enum NotificationType { //! shuni ozi iwlatiladi 
	LIKE = 'LIKE',
	COMMENT = 'COMMENT',
	MESSAGE = 'MESSAGE',
}
registerEnumType(NotificationType, {
	name: 'NotificationType',
});

export enum NotificationStatus {
	WAIT = 'WAIT',
	READ = 'READ',
}
registerEnumType(NotificationStatus, {
	name: 'NotificationStatus',
});

export enum NotificationGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	GADGET = 'GADGET',
	MESSAGE = 'MESSAGE',
}
registerEnumType(NotificationGroup, {
	name: 'NotificationGroup',
});
