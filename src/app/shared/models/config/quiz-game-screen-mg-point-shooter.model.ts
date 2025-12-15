import {AppConfig} from '../../../app.config';

export class QuizGameScreenMgPointShooterModel
{
	//public dialogResult: ConfigContainerModel = ConfigContainerModel.getModelFromJSON({});
	//public btnDialogResult: ConfigButtonModel = ConfigButtonModel.getModelFromJSON({});
	
	constructor(
		public borderColor: string = AppConfig.quizGameDefaultMinigameMainColor,
		public fontColor: string = AppConfig.quizGameDefaultMinigameFontColor,
		public fontColorTgt: string = AppConfig.quizGameDefaultMinigameFontColor,
		public colorBg1: string = AppConfig.quizGameDefaultMinigameBackgroundColor1,
		public colorBg2: string = AppConfig.quizGameDefaultMinigameBackgroundColor2,
		public buttonColor: string = AppConfig.quizGameDefaultMinigameMainColor,
		public ballColor: string = AppConfig.quizGameDefaultMinigameBallColor,
		public ballHoldColor: string = AppConfig.quizGameDefaultMinigameMainColor,
		public ballHoldColor2: string = AppConfig.quizGameDefaultMinigameMainColor,
		public ballHoldGumColor: string = AppConfig.quizGameDefaultMinigameMainColor,
		public ballHoldShotColor: string = AppConfig.quizGameDefaultMinigameBallHolderShotColor,
		public tgtOutColor: string = AppConfig.quizGameDefaultMinigameTargetBackgroundColor2,
		public tgtBgColor: string = AppConfig.quizGameDefaultMinigameTargetBackgroundColor2,
		public tgtBgHoleColor: string = AppConfig.quizGameDefaultMinigameTargetHoleBackgroundColor,
		public obstArrowColor: string = AppConfig.quizGameDefaultMinigameMainColor,
		public obstOutColor: string = AppConfig.quizGameDefaultMinigameMainColor,
		public obstBgColor: string = AppConfig.quizGameDefaultMinigameObstacleBackgroundColor,
		public obstBgActiveColor: string = AppConfig.quizGameDefaultMinigameBallLightColor
	)
	{
	}
	
	public static getModelFromJSON(jsonObj: any): QuizGameScreenMgPointShooterModel
	{
		if (!jsonObj)
		{
			return new QuizGameScreenMgPointShooterModel();
		}
		
		const model = new QuizGameScreenMgPointShooterModel(
			jsonObj['borderColor'] ?? AppConfig.quizGameDefaultMinigameMainColor,
			jsonObj['fontColor'] ?? AppConfig.quizGameDefaultMinigameFontColor,
			jsonObj['fontColorTgt'] ?? AppConfig.quizGameDefaultMinigameFontColor,
			jsonObj['colorBg1'] ?? AppConfig.quizGameDefaultMinigameBackgroundColor1,
			jsonObj['colorBg2'] ?? AppConfig.quizGameDefaultMinigameBackgroundColor2,
			jsonObj['buttonColor'] ?? AppConfig.quizGameDefaultMinigameMainColor,
			jsonObj['ballColor'] ?? AppConfig.quizGameDefaultMinigameBallColor,
			jsonObj['ballHoldColor'] ?? AppConfig.quizGameDefaultMinigameMainColor,
			jsonObj['ballHoldColor2'] ?? AppConfig.quizGameDefaultMinigameMainColor,
			jsonObj['ballHoldGumColor'] ?? AppConfig.quizGameDefaultMinigameMainColor,
			jsonObj['ballHoldShotColor'] ?? AppConfig.quizGameDefaultMinigameBallHolderShotColor,
			jsonObj['tgtOutColor'] ?? AppConfig.quizGameDefaultMinigameTargetBackgroundColor2,
			jsonObj['tgtBgColor'] ?? AppConfig.quizGameDefaultMinigameTargetBackgroundColor2,
			jsonObj['tgtBgHoleColor'] ?? AppConfig.quizGameDefaultMinigameTargetHoleBackgroundColor,
			jsonObj['obstArrowColor'] ?? AppConfig.quizGameDefaultMinigameMainColor,
			jsonObj['obstOutColor'] ?? AppConfig.quizGameDefaultMinigameMainColor,
			jsonObj['obstBgColor'] ?? AppConfig.quizGameDefaultMinigameObstacleBackgroundColor,
			jsonObj['obstBgActiveColor'] ?? AppConfig.quizGameDefaultMinigameBallLightColor
		);
		
		//model.dialogResult = ConfigContainerModel.getModelFromJSON(jsonObj['dialogResult']);
		//model.btnDialogResult = ConfigButtonModel.getModelFromJSON(jsonObj['btnDialogResult']);
		
		if (model)
		{
			// prepared for later
		}
		
		return model;
	}
}