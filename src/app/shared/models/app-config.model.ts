import {UtilObj} from '../utils/util-obj';

export class AppConfigModel
{
	constructor(
		public stationID: string,
		public stillThereSeconds: number,
		public stillThereLastSeconds: number,
		public gameTitle: string,
		public eventName: string,
		public windowsOnScreenKeyboard: boolean
	)
	{
	}
	
	public static getModelFromJson(json: string): AppConfigModel
	{
		let obj: {
			stationID: undefined;
			stillThereSeconds: undefined;
			stillThereLastSeconds: undefined;
			gameTitle: undefined;
			eventName: undefined;
			windowsOnScreenKeyboard: false;
		} = {
			stationID: undefined,
			stillThereSeconds: undefined,
			stillThereLastSeconds: undefined,
			gameTitle: undefined,
			eventName: undefined,
			windowsOnScreenKeyboard: false
		};
		
		try
		{
			obj = JSON.parse(json);
		}
		catch (e)
		{
			console.error('Unable to parse config.json', e);
		}
		
		return new AppConfigModel(
			obj.stationID || 'ts30',
			obj.stillThereSeconds && UtilObj.isset(obj.stillThereSeconds) ? parseInt(obj.stillThereSeconds, 10) : 120,
			obj.stillThereLastSeconds && UtilObj.isset(obj.stillThereLastSeconds) ? parseInt(obj.stillThereLastSeconds, 10) : 20,
			obj.gameTitle || 'ROY Speed Quiz Game',
			obj.eventName || 'Convention',
			obj.windowsOnScreenKeyboard !== undefined ? obj.windowsOnScreenKeyboard || false : true
		);
	}
}