import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'
import { Model, ObjectId } from 'mongoose'
import { BoardArticle, BoardArticles } from '../../libs/dto/board-article/board-article'
import { ViewService } from '../view/view.service'
import { MemberService } from '../member/member.service'
import { AllBoardArticlesInquiry, BoardArticleInput, BoardArticlesInquiry } from '../../libs/dto/board-article/board-article.input'
import { Message } from '../../libs/enums/common.enums'
import { StatisticModifier, T } from '../../libs/types/common'
import { BoardArticleStatus } from '../../libs/enums/board-article.enum'
import { ViewGroup } from '../../libs/enums/view.enum'
import { LikeGroup } from '../../libs/enums/like.enum'
import { BoardArticleUpdate } from '../../libs/dto/board-article/board-article.update'
import { Direction } from '../../libs/enums/member.enum'
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config'

@Injectable()
export class BoardArticleService {
constructor(
	@InjectModel('BoardArticle') private readonly boardArticleModel: Model<BoardArticle>,
	private viewService: ViewService,
	private memberService: MemberService,
) {}


public async createBoardArticle(memberId: ObjectId, input: BoardArticleInput): Promise<BoardArticle> {
	input.memberId = memberId;
	try {
		console.log(memberId);
		const result = await this.boardArticleModel.create(input);
		console.log(result);
		await this.memberService.memberStatsEditor({ _id: memberId, targetKey: 'memberArticle', modifier: 1 });
		return result;
	} catch (error) {
		console.log('Error: CreateBoardArticle:', error);
		throw new BadRequestException(Message.CREATE_FAILED);
	}
}

public async getBoardArticle(memberId: ObjectId, articleId: ObjectId): Promise<BoardArticle> {
	const search: T = {
		_id: articleId,
		articleStatus: BoardArticleStatus.ACTIVE,
	};

	const targetBoardArticle: BoardArticle = await this.boardArticleModel.findOne(search).lean().exec(); //? lean() bu Modify qilish uchun imkoniyat beradi object qilib beradi 
	if (!targetBoardArticle) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

	if (memberId) {
		const viewInput = { memberId: memberId, viewRefId: articleId, viewGroup: ViewGroup.ARTICLE };
		const newView = await this.viewService.recordView(viewInput);
		if (newView) {
			await this.boardArticleStateEditor({ _id: articleId, targetKey: 'articleViews', modifier: 1 });
			targetBoardArticle.articleViews++;
		}
		//meLiked
		// const likeInput = { memberId: memberId, likeRefId: articleId, likeGroup: LikeGroup.ARTICLE };
		// targetBoardArticle.meLiked = await this.likeService.checkLikeExistance(likeInput);
	}
	targetBoardArticle.memberData = await this.memberService.getMember(null, targetBoardArticle.memberId);
	return targetBoardArticle;
}

public async updateBoardArticle(memberId: ObjectId, input: BoardArticleUpdate): Promise<BoardArticle> {
	const { _id, articleStatus } = input;

	const result = await this.boardArticleModel
		.findOneAndUpdate(
			{
				_id: _id, // ozgartirmoqchi bolgan article Idsi ozimiziki bolishi shart
				memberId: memberId, // ozimizni Id bolish kk
				articleStatus: BoardArticleStatus.ACTIVE,
			},
			input,
			{
				new: true,
			},
		)
		.exec();
	if (!result) throw new InternalServerErrorException(Message.UPDATE_FALED);

	if (articleStatus === BoardArticleStatus.DELETE)
		await this.memberService.memberStatsEditor({
			_id: memberId,
			targetKey: 'memberArticles',
			modifier: -1,
		});
	return result;
}

public async getBoardArticles(memberId: ObjectId, input: BoardArticlesInquiry): Promise<BoardArticles> {
	const { articleCategory, text } = input.search;
	const match: T = { articleStatus: BoardArticleStatus.ACTIVE };
	const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC }; // sort xamda direction kiritilmagan  bolsa createdAt da xosil qiladi Directiondi Desc da xosil qiladi -1
	console.log('match>>>:', input.search);

	if (articleCategory) match.articleCategory = articleCategory; // ?
	if (text) match.articleTitle = { $regex: new RegExp(text, 'i') };
	if (input.search?.memberId) {
		// Ayni bir memberimizni articlarini kormoqchi bolsek  memberIdni xam kiritishimiz mumkin BoardArticlesInqueryda aytib otganmiz
		match.memberId = shapeIntoMongoObjectId(input.search.memberId);
	}
	console.log('match>>>:', match);

	const result = await this.boardArticleModel
		.aggregate([
			{ $match: match },
			{ $sort: sort },
			{
				$facet: {
					list: [
						{ $skip: (input.page - 1) * input.limit },
						{ $limit: input.limit },
						//meLiked
						lookupAuthMemberLiked(memberId), // bydefault '_id' bolgani uchun yzoib otirmadik 
						lookupMember,
						{ $unwind: '$memberData' },
					],
					metaCounter: [{ $count: 'total' }],
				},
			},
		])
		.exec();
	if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
	return result[0];
}

/* // *******************************************************************
	!																		ADMIN
	* ***********************************************************************/

	public async getAllBoardArticlesByAdmin(memberId: ObjectId, input: AllBoardArticlesInquiry): Promise<BoardArticles> {
		const { articleStatus, articleCategory } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC }; // sort xamda direction kiritilmagan  bolsa createdAt da xosil qiladi Directiondi Desc da xosil qiladi -1

		if (articleStatus) match.articleStatus = articleStatus; // ?
		if (articleCategory) match.articleCategory = articleCategory; // ?

		console.log('match>>>:', match);

		const result = await this.boardArticleModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							//meLiked
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	public async updateBoardArticleByAdmin(input: BoardArticleUpdate): Promise<BoardArticle> {
		const { _id, articleStatus } = input;

		const result = await this.boardArticleModel
			.findOneAndUpdate(
				{
					_id: _id, // ozgartirmoqchi bolgan article Idsi ozimiziki bolishi shart
					articleStatus: BoardArticleStatus.ACTIVE,
				},
				input,
				{
					new: true,
				},
			)
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FALED);

		if (articleStatus === BoardArticleStatus.DELETE)
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberArticles',
				modifier: -1,
			});
		return result;
	}

	public async removeBoardArticleByAdmin(articleId: ObjectId): Promise<BoardArticle> {
		const search: T = { _id: articleId, articleStatus: BoardArticleStatus.DELETE };
		const result = await this.boardArticleModel.findOneAndDelete(search).exec();

		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		return result;
	}

/* // *******************************************************************
	!																		STATS-EDITOR
	* ***********************************************************************/
public async boardArticleStateEditor(input: StatisticModifier): Promise<BoardArticle> {
	console.log('MemberStatisticEditor');
	
	const { _id, targetKey, modifier } = input;
	return await this.boardArticleModel
		.findByIdAndUpdate(
			_id,
			{ $inc: { [targetKey]: modifier } },
			{
				new: true,
			},
		)
		.exec();
}


}
