import {AppConfig} from '../../../app.config';
import {ConfigButtonModel} from './config-button.model';
import {ConfigContainerModel} from './config-container.model';

export class QuizGameScreenMinigamesModel
{
	public dialogResult: ConfigContainerModel = ConfigContainerModel.getModelFromJSON({});
	public btnDialogResult: ConfigButtonModel = ConfigButtonModel.getModelFromJSON({});
	
	constructor(
		public dialogResultTitleColor: string = AppConfig.quizGameDefaultFontColorMain,
		public dialogResultScoreColor: string = AppConfig.quizGameDefaultFontColorMain
	)
	{
	}
	
	public static getModelFromJSON(jsonObj: any): QuizGameScreenMinigamesModel
	{
		if (!jsonObj)
		{
			return new QuizGameScreenMinigamesModel();
		}
		
		const model = new QuizGameScreenMinigamesModel(
			jsonObj['dialogResult'] ? (jsonObj['dialogResult']['titleColor'] ?? AppConfig.quizGameDefaultFontColorMain) : AppConfig.quizGameDefaultFontColorMain,
			jsonObj['dialogResult'] ? (jsonObj['dialogResult']['scoreColor'] ?? AppConfig.quizGameDefaultFontColorMain) : AppConfig.quizGameDefaultFontColorMain,
		);
		
		model.dialogResult = ConfigContainerModel.getModelFromJSON(jsonObj['dialogResult']);
		model.btnDialogResult = ConfigButtonModel.getModelFromJSON(jsonObj['btnDialogResult']);
		
		return model;
	}
}