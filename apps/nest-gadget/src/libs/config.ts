import { ObjectId } from 'bson';


export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target;
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