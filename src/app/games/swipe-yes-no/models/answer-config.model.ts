export class AnswerConfigModel
{
	constructor(
		public answerKey: string,
		public imageUrl: string | null,
		public isCorrect: boolean
	)
	{
	}
	
	public static getListFromJSON(jsonList: Array<any>): Array<AnswerConfigModel>
	{
		const list: Array<AnswerConfigModel> = [];
		
		if (!jsonList)
		{
			return [];
		}
		
		for (const jsonObj of jsonList)
		{
			const model: AnswerConfigModel | null = AnswerConfigModel.getModelFromJSON(jsonObj);
			
			if (model)
			{
				list.push(model);
			}
		}
		
		//list = AnswerConfigModel.sortList(list);
		
		return list;
	}
	
	/*public static sortList(list: Array<AnswerConfigModel>): Array<AnswerConfigModel>
	{
		return list.sort((a, b) => a.id - b.id);
	}*/
	
	public static getModelFromJSON(jsonObj: any): AnswerConfigModel | null
	{
		if (!jsonObj)
		{
			return null;
		}
		
		return new AnswerConfigModel(
			jsonObj['key'] || '',
			jsonObj['imageUrl'] || null,
			jsonObj['isCorrect'] ?? false
		);
	}
}