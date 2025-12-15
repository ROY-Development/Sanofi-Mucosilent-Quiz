import {UtilObj} from '../../../shared/utils/util-obj';
import {AnswerConfigModel} from './answer-config.model';
import {UtilArray} from '../../../shared/utils/util-array';
import {BackgroundAnimationTypeEnum} from '../../../shared/enums/background-animation-type.enum';

export class QuestionConfigModel
{
	constructor(
		public id: number,
		public answerConfigs: Array<AnswerConfigModel>,
		public leftCorrect: boolean,
		public hasAutomaticAnswer: boolean,
		public questionColor: string | null,
		public backgroundImageUrl: string | null,
		public backgroundColorsDuration: number | null,
		public backgroundColors: Array<string> | null,
		public backgroundAnimationType: BackgroundAnimationTypeEnum,
		public backgroundAnimationImageUrls: Array<string> | null,
	)
	{
	}
	
	public static getListFromJSON(jsonList: Array<any>): Array<QuestionConfigModel>
	{
		let list: Array<QuestionConfigModel> = [];
		
		if (!jsonList)
		{
			return [];
		}
		
		for (const jsonObj of jsonList)
		{
			const model: QuestionConfigModel | null = QuestionConfigModel.getModelFromJSON(jsonObj);
			
			if (model)
			{
				list.push(model);
			}
		}
		
		list = QuestionConfigModel.sortList(list);
		
		return list;
	}
	
	public static sortList(list: Array<QuestionConfigModel>): Array<QuestionConfigModel>
	{
		return list.sort((a, b) => a.id - b.id);
	}
	
	public static getModelFromJSON(jsonObj: any): QuestionConfigModel | null
	{
		if (!jsonObj)
		{
			return null;
		}
		
		const id: number = UtilObj.isset(jsonObj['id']) ? parseInt(jsonObj['id']) : 0;
		
		const answerConfigs: Array<AnswerConfigModel> = AnswerConfigModel.getListFromJSON(jsonObj.answers);
		const backgroundAnimationImageUrls: Array<string> | null = UtilObj.isset(jsonObj['backgroundAnimationImageUrls']) && Array.isArray(jsonObj['backgroundAnimationImageUrls']) ?
			jsonObj['backgroundAnimationImageUrls'] : null;
		if (backgroundAnimationImageUrls)
		{
			UtilArray.shuffleArray(backgroundAnimationImageUrls);
		}
		
		return new QuestionConfigModel(
			id,
			answerConfigs,
			UtilObj.isset(jsonObj['leftCorrect']) ? !!jsonObj['leftCorrect'] : false,
			UtilObj.isset(jsonObj['hasAutomaticAnswer']) ? !!jsonObj['hasAutomaticAnswer'] : false,
			UtilObj.isset(jsonObj['questionColor']) ? jsonObj['questionColor'] : null,
			UtilObj.isset(jsonObj['backgroundImageUrl']) ? jsonObj['backgroundImageUrl'] : null,
			UtilObj.isset(jsonObj['backgroundColorsDuration']) ? parseInt(jsonObj['backgroundColorsDuration']) : null,
			UtilObj.isset(jsonObj['backgroundColors']) && Array.isArray(jsonObj['backgroundColors']) ?
				jsonObj['backgroundColors'] : null,
			UtilObj.isset(jsonObj['backgroundAnimationType']) ?
				(jsonObj['backgroundAnimationType'] as BackgroundAnimationTypeEnum) :
				BackgroundAnimationTypeEnum.oneStep,
			backgroundAnimationImageUrls,
		);
	}
}