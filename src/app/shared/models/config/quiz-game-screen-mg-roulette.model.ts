import {AppConfig} from '../../../app.config';

export class QuizGameScreenMgRouletteModel
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
		public ballHoldGumColor: string = AppConfig.quizGameDefaultMinigameMainColor,
		public ballHoldShotColor: string = AppConfig.quizGameDefaultMinigameBallHolderShotColor,
		public tgtBgColor: string = AppConfig.quizGameDefaultMinigameMainColorA02,
		public tgtBgColor2: string = AppConfig.quizGameDefaultMinigameMainColorA03,
		public tgtOutColor: string = AppConfig.quizGameDefaultMinigameMainColor,
		public tgtBgRollColor: string = AppConfig.quizGameDefaultMinigameMainColorA06,
		public tgtBgLockColor: string = AppConfig.quizGameDefaultMinigameMainColorA08,
	)
	{
	}
	
	public static getModelFromJSON(jsonObj: any): QuizGameScreenMgRouletteModel
	{
		if (!jsonObj)
		{
			return new QuizGameScreenMgRouletteModel();
		}
		
		const model = new QuizGameScreenMgRouletteModel(
			jsonObj['borderColor'] ?? AppConfig.quizGameDefaultMinigameMainColor,
			jsonObj['fontColor'] ?? AppConfig.quizGameDefaultMinigameFontColor,
			jsonObj['fontColorTgt'] ?? AppConfig.quizGameDefaultMinigameFontColor,
			jsonObj['colorBg1'] ?? AppConfig.quizGameDefaultMinigameBackgroundColor1,
			jsonObj['colorBg2'] ?? AppConfig.quizGameDefaultMinigameBackgroundColor2,
			jsonObj['buttonColor'] ?? AppConfig.quizGameDefaultMinigameMainColor,
			jsonObj['ballColor'] ?? AppConfig.quizGameDefaultMinigameBallColor,
			jsonObj['ballHoldGumColor'] ?? AppConfig.quizGameDefaultMinigameMainColor,
			jsonObj['ballHoldShotColor'] ?? AppConfig.quizGameDefaultMinigameBallHolderShotColor,
			jsonObj['tgtBgColor'] ?? AppConfig.quizGameDefaultMinigameMainColorA02,
			jsonObj['tgtBgColor2'] ?? AppConfig.quizGameDefaultMinigameMainColorA03,
			jsonObj['tgtOutColor'] ?? AppConfig.quizGameDefaultMinigameMainColor,
			jsonObj['tgtBgRollColor'] ?? AppConfig.quizGameDefaultMinigameMainColorA06,
			jsonObj['tgtBgLockColor'] ?? AppConfig.quizGameDefaultMinigameMainColorA08,
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