import { ObjectId } from 'bson';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target;
};

//* IMAGE CONFIGURATION

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
export const getSerialForImage = (filename: string) => {
	const ext = path.parse(filename).ext;
	return uuidv4() + ext;
};

// Agenti sort qilish tartibi
export const availbleAgentSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank'];
export const availbleMemberSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews'];
export const availableOptions = ['gadgetBarter', 'gadgetRent'];
export const availableGadgetSorts = [
	'createdAt',
	'updatedAt',
	'gadgetLikes',
	'gadgetViews',
	'gadgetRank',
	'gadgetPrice',
];

export const lookupVisit = {
	$lookup: {
		from: 'members',
		localField: 'visitedGadget.memberId',
		foreignField: '_id',
		as: 'visitedGadget.memberData',
	},
};
