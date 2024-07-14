import { ObjectId } from 'bson';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { T } from './types/common';


/* // *******************************************************************
	!																			IMAGE 
	* ***********************************************************************/
export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
export const getSerialForImage = (filename: string) => {
	const ext = path.parse(filename).ext;
	return uuidv4() + ext;
};

/* // *******************************************************************
	!																			SORTING
	* ***********************************************************************/
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

export const availableBoardArticleSorts = ['createdAt', 'updatedAt', 'articleLikes', 'articleViews'];

export const availableCommentSorts = ['createdAt', 'updatedAt'];

/* // *******************************************************************
	!																			LookupMember
	* ***********************************************************************/
export const lookupMember = {
	$lookup: {
		from: 'members',
		localField: 'memberId',
		foreignField: '_id',
		as: 'memberData',
	},
};

export const lookupVisit = {
	$lookup: {
		from: 'members',
		localField: 'visitedGadget.memberId',
		foreignField: '_id',
		as: 'visitedGadget.memberData',
	},
};
/* // *******************************************************************
	!																			LookupAuthMemberLiked 
	* ***********************************************************************/
export const lookupAuthMemberLiked = (memberId: T, targerRefId: string = '$_id') => {
	return {
		$lookup: {
			from: 'likes', // qaysi collectiondan izlasin
			let: {
				//search mehanizmga Vasriablelar
				localLikeRefId: targerRefId, // '$_id'
				localMemberId: memberId,
				localMyFavorite: true, //fronenda foyda beradi
			},
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [{ $eq: ['$likeRefId', '$$localLikeRefId'] }, { $eq: ['$memberId', '$$localMemberId'] }], //Solishtirish mantigi  Eq 'nimalarni solishtirishimizni kochirib olamiz'
						},
					},
				},
				{
					$project: {
						_id: 0,
						memberId: 1,
						likeRefId: 1,
						myFavorite: '$$localMyFavorite', // togridan togri true qilmadik agar shu mantiq togri ishlasa deb belgilab oldik
					},
				},
			],
			as: 'meLiked', // qanday nom bilan saqlashlik
		},
	};
};


	/* // *******************************************************************
	!																			SHAPENG 
	* ***********************************************************************/
export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target;
};

