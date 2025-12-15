import {UtilObj} from '../utils/util-obj';

export class AppQueryParamsModel
{
	constructor(
		public categoryId: string | null = null,
		public debug: boolean = false
	)
	{
	}
	
	public static getModelFromJson(jsonObj: any): AppQueryParamsModel
	{
		return new AppQueryParamsModel(
			UtilObj.isset(jsonObj['categoryId']) ? jsonObj['categoryId'] : null,
			UtilObj.isset(jsonObj['debug']) ? jsonObj['debug'] : false
		);
	}
}