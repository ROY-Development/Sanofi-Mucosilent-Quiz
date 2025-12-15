import {AppConfig} from '../../../app.config';
import {UtilObj} from '../../utils/util-obj';

export class ConfigButtonModel
{
	/* TODO neue werte speziell für start button
	icon image PNG
	 */
	
	public radius: number = AppConfig.quizGameDefaultButtonRadiusPx;
	public glowColor: string = AppConfig.quizGameDefaultButtonGlowColor;
	public glowRadius: number = AppConfig.quizGameDefaultButtonGlowRadiusPx;
	public glowDuration: number = AppConfig.quizGameDefaultButtonGlowDuration;
	public pulseScale: number = AppConfig.quizGameDefaultButtonPulseScale;
	public pulseDuration: number = AppConfig.quizGameDefaultButtonPulseDuration;
	
	constructor(
		public fontColor: string = AppConfig.quizGameDefaultFontColorButton,
		public colorBg: string = AppConfig.quizGameDefaultColorButtonBg,
		public border: number = AppConfig.quizGameDefaultButtonBorderPx,
		public borderColor: string = AppConfig.quizGameDefaultFontColorButton
	)
	{
	}
	
	public static getModelFromJSON(jsonObj: any): ConfigButtonModel
	{
		if (!jsonObj)
		{
			return new ConfigButtonModel();
		}
		
		const model = new ConfigButtonModel(
			jsonObj['fontColor'] ?? AppConfig.quizGameDefaultFontColorButton,
			jsonObj['colorBg'] ?? AppConfig.quizGameDefaultColorButtonBg,
			UtilObj.isset(jsonObj['border']) ? parseInt(jsonObj['border'], 10) : AppConfig.quizGameDefaultButtonBorderPx,
			jsonObj['borderColor'] ?? AppConfig.quizGameDefaultButtonBorderColor
		);
		
		if (UtilObj.isset(jsonObj['radius']))
		{
			model.radius = parseInt(jsonObj['radius'], 10);
		}
		if (jsonObj['glowColor'])
		{
			model.glowColor = jsonObj['glowColor'];
		}
		if (UtilObj.isset(jsonObj['glowRadius']))
		{
			model.glowRadius = parseInt(jsonObj['glowRadius'], 10);
		}
		if (UtilObj.isset(jsonObj['glowDuration']))
		{
			model.glowDuration = parseInt(jsonObj['glowDuration'], 10);
		}
		if (UtilObj.isset(jsonObj['pulseScale']))
		{
			model.pulseScale = parseFloat(jsonObj['pulseScale']);
		}
		if (UtilObj.isset(jsonObj['pulseDuration']))
		{
			model.pulseDuration = parseFloat(jsonObj['pulseDuration']);
		}
		
		return model;
	}
}