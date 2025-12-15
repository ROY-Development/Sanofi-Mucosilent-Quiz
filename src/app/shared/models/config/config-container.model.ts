import {AppConfig} from '../../../app.config';
import {UtilObj} from '../../utils/util-obj';

export class ConfigContainerModel
{
	public colorBg2: string = AppConfig.quizGameDefaultBackgroundColor;
	public colorBg3: string = AppConfig.quizGameDefaultBackgroundColor;
	public colorBg4: string = AppConfig.quizGameDefaultBackgroundColor;
	public colorBg5: string = AppConfig.quizGameDefaultBackgroundColor;
	
	public isFontBold: boolean = false;
	public radius: number = AppConfig.quizGameDefaultButtonRadiusPx;
	public border: number = AppConfig.quizGameDefaultContainerBorderPx;
	public borderColor: string = AppConfig.quizGameDefaultContainerBorderColor;
	
	constructor(
		public fontColor: string = AppConfig.quizGameDefaultFontColorMain,
		public colorBg: string = AppConfig.quizGameDefaultBackgroundColor
	)
	{
	}
	
	public static getModelFromJSON(jsonObj: any): ConfigContainerModel
	{
		if (!jsonObj)
		{
			return new ConfigContainerModel();
		}
		
		const model = new ConfigContainerModel(
			jsonObj['fontColor'] ?? AppConfig.quizGameDefaultFontColorMain,
			jsonObj['colorBg'] ?? AppConfig.quizGameDefaultBackgroundColor
		);
		
		if (UtilObj.isset(jsonObj['colorBg2']))
		{
			model.colorBg2 = jsonObj['colorBg2'];
		}
		
		if (UtilObj.isset(jsonObj['colorBg3']))
		{
			model.colorBg3 = jsonObj['colorBg3'];
		}
		
		if (UtilObj.isset(jsonObj['colorBg4']))
		{
			model.colorBg4 = jsonObj['colorBg4'];
		}
		
		if (UtilObj.isset(jsonObj['colorBg5']))
		{
			model.colorBg5 = jsonObj['colorBg5'];
		}
		
		if (UtilObj.isset(jsonObj['isFontBold']))
		{
			model.isFontBold = !!jsonObj['isFontBold'];
		}
		
		if (UtilObj.isset(jsonObj['radius']))
		{
			model.radius = parseInt(jsonObj['radius'], 10);
		}
		
		if (UtilObj.isset(jsonObj['border']))
		{
			model.border = parseInt(jsonObj['border'], 10);
		}
		
		if (UtilObj.isset(jsonObj['borderColor']))
		{
			model.borderColor = jsonObj['borderColor'];
		}
		
		return model;
	}
}