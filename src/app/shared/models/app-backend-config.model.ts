import {UtilObj} from '../utils/util-obj';

export class AppBackendConfigModel
{
	constructor(
		public mushroomButtons: Array<{ gamepadId: string, buttonIndex: number }>
	)
	{
	}
	
	public static getModelFromJson(jsonObj: any): AppBackendConfigModel
	{
		const mushroomButtons: Array<{ gamepadId: string, buttonIndex: number }> = [];
		
		if (jsonObj.mushroomButtons && Array.isArray(jsonObj.mushroomButtons))
		{
			for (let i = 0, n = jsonObj.mushroomButtons.length; i < n; ++i)
			{
				const obj: any = jsonObj.mushroomButtons[i];
				if (UtilObj.isset(obj.gamepadId) && UtilObj.isset(obj.buttonIndex))
				{
					mushroomButtons.push(
						{
							gamepadId: obj.gamepadId,
							buttonIndex: obj.buttonIndex
						}
					)
				}
			}
		}
		
		return new AppBackendConfigModel(
			mushroomButtons
		);
	}
}