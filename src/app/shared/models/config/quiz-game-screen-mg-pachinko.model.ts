import {AppConfig} from '../../../app.config';

export class QuizGameScreenMgPachinkoModel
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
		public tgtOutColor: string = AppConfig.quizGameDefaultMinigameOutlineColor,
		public tgtBgColor: string = AppConfig.quizGameDefaultMinigameMainColor,
		public tgtBgActColor: string = AppConfig.quizGameDefaultMinigameBallColor,
		public nailColor: string = AppConfig.quizGameDefaultMinigameMainColor
	)
	{
	}
	
	public static getModelFromJSON(jsonObj: any): QuizGameScreenMgPachinkoModel
	{
		if (!jsonObj)
		{
			return new QuizGameScreenMgPachinkoModel();
		}
		
		const model = new QuizGameScreenMgPachinkoModel(
			jsonObj['borderColor'] ?? AppConfig.quizGameDefaultMinigameMainColor,
			jsonObj['fontColor'] ?? AppConfig.quizGameDefaultMinigameFontColor,
			jsonObj['fontColorTgt'] ?? AppConfig.quizGameDefaultMinigameFontColor,
			jsonObj['colorBg1'] ?? AppConfig.quizGameDefaultMinigameBackgroundColor1,
			jsonObj['colorBg2'] ?? AppConfig.quizGameDefaultMinigameBackgroundColor2,
			jsonObj['buttonColor'] ?? AppConfig.quizGameDefaultMinigameMainColor,
			jsonObj['ballColor'] ?? AppConfig.quizGameDefaultMinigameBallColor,
			jsonObj['ballHoldColor'] ?? AppConfig.quizGameDefaultMinigameMainColor,
			jsonObj['ballHoldColor2'] ?? AppConfig.quizGameDefaultMinigameMainColor,
			jsonObj['tgtOutColor'] ?? AppConfig.quizGameDefaultMinigameOutlineColor,
			jsonObj['tgtBgColor'] ?? AppConfig.quizGameDefaultMinigameTargetBackgroundColor,
			jsonObj['tgtBgActColor'] ?? AppConfig.quizGameDefaultMinigameBallColor,
			jsonObj['nailColor'] ?? AppConfig.quizGameDefaultMinigameMainColor
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