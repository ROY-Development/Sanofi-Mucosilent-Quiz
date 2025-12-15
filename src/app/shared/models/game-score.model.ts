import {UtilObj} from '../utils/util-obj';

export class GameScoreModel
{
	constructor(
		//public gsNumber: string,
		public nickname: string,
		public score: number,
		public correctRate: number,
		public createdAt: string
	)
	{
	}
	
	public static getListFromJSON(jsonList: Array<any>): Array<GameScoreModel>
	{
		let list: Array<GameScoreModel> = [];
		
		if (!jsonList)
		{
			return [];
		}
		
		for (const jsonObj of jsonList)
		{
			const model: GameScoreModel | null = GameScoreModel.getModelFromJSON(jsonObj);
			
			if (model)
			{
				list.push(model);
			}
		}
		
		list = GameScoreModel.sortList(list);
		
		return list;
	}
	
	public static sortList(list: Array<GameScoreModel>): Array<GameScoreModel>
	{
		return list.sort((a, b) => a.score - b.score);
	}
	
	public static getModelFromJSON(jsonObj: any): GameScoreModel | null
	{
		if (!jsonObj)
		{
			return null;
		}
		
		return new GameScoreModel(
			jsonObj['nickname'] ?? '',
			UtilObj.isset(jsonObj['score']) ? parseInt(jsonObj['score']) : 0,
			UtilObj.isset(jsonObj['correctRate']) ? parseFloat(jsonObj['correctRate']) : 0,
			jsonObj['createdAt'] ?? ''
		);
	}
}