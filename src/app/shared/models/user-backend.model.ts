import {UtilObj} from '../utils/util-obj';

export class UserBackendModel
{
	constructor(
		public acId: string,
		public meta: number | null, // last question id
		public timestamp: string
	)
	{
	}
	
	public static getModelFromJSON(jsonObj: any): UserBackendModel | null
	{
		if (!jsonObj)
		{
			return null;
		}
		
		return new UserBackendModel(
			jsonObj['acId'] || '',
			UtilObj.isset(jsonObj['meta']) ? parseInt(jsonObj['meta'], 10) : null,
			jsonObj['timestamp'] || ''
		);
	}
}