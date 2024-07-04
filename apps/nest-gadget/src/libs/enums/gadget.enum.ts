import { registerEnumType } from '@nestjs/graphql';

export enum GadgetType {
	APPLE = 'APPLE',
	SAMSUNG = 'SAMSUNG',
	XIOMI = 'XIOMI',
}
registerEnumType(GadgetType, {
	name: 'GadgetType',
});

export enum GadgetStatus {
	// HOLD = 'HOLD', //! keyn foydalansa boladi
	ACTIVE = 'ACTIVE',
	SOLD = 'SOLD',
	DELETE = 'DELETE',
}
registerEnumType(GadgetStatus, {
	name: 'GadgetStatus',
});

export enum GadgetLocation {
	SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	GYEONGJU = 'GYEONGJU',
	GWANGJU = 'GWANGJU',
	CHONJU = 'CHONJU',
	DAEJON = 'DAEJON',
	JEJU = 'JEJU',
}
registerEnumType(GadgetLocation, {
	name: 'GadgetLocation',
});
