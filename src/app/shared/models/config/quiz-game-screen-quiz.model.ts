import {AppConfig} from '../../../app.config';
import {UtilObj} from '../../utils/util-obj';
import {ConfigButtonModel} from './config-button.model';
import {ConfigContainerModel} from './config-container.model';

export class QuizGameScreenQuizModel
{
	// public radius: number = AppConfig.quizGameDefaultButtonRadiusPx;
	public questionCard: ConfigContainerModel = ConfigContainerModel.getModelFromJSON({});
	public questionCardGold: ConfigContainerModel = ConfigContainerModel.getModelFromJSON({
		colorBg: '#FEDB37',
		colorBg2: '#FDB931',
		colorBg3: '#9f7928',
		colorBg4: '#8A6E2F',
		colorBg5: '#5d4a1f'
	});
	public timeBar: ConfigContainerModel = ConfigContainerModel.getModelFromJSON({
		colorBg: '#2b2b2b',
		colorBg2: '#72a878',
		colorBg3: '#ac7a29',
		colorBg4: '#bf5832',
		colorBg5: '#ca3434'
	});
	public btnAnswer: ConfigButtonModel = ConfigButtonModel.getModelFromJSON({});
	public btnFeedback: ConfigButtonModel = ConfigButtonModel.getModelFromJSON({});
	public dialogWrong: ConfigContainerModel = ConfigContainerModel.getModelFromJSON({});
	public btnDialogWrong: ConfigButtonModel = ConfigButtonModel.getModelFromJSON({});
	public dialogResult: ConfigContainerModel = ConfigContainerModel.getModelFromJSON({});
	public btnDialogResult: ConfigButtonModel = ConfigButtonModel.getModelFromJSON({});
	
	constructor(
		public statusBarColorLine: string = AppConfig.quizGameDefaultFontColorMain,
		public statusBarColorCorrect: string = AppConfig.quizGameDefaultColorCorrect,
		public statusBarColorWrong: string = AppConfig.quizGameDefaultColorWrong,
		public questionColor: string = AppConfig.quizGameDefaultFontColorMain,
		public dialogResultTitleColor: string = AppConfig.quizGameDefaultFontColorMain,
		public dialogResultStarColor: string = AppConfig.quizGameDefaultFontColorMain,
		public dialogResultScoreColor: string = AppConfig.quizGameDefaultFontColorMain,
		public imageSwipe: string | null = null,
		public imageGreat: string | null = null,
		public fontColorFeedback: string = AppConfig.quizGameDefaultFontColorMain,
		public tableColorBgRowOdd: string = AppConfig.quizGameDefaultTableBackgroundRowOddColor,
		public tableRadius: number = AppConfig.quizGameDefaultTableRadiusPx,
		public tableBorder: number = AppConfig.quizGameDefaultTableBorderPx,
		public tableBorderColor: string = AppConfig.quizGameDefaultTableBorderColor,
		public fontColorRank: string = AppConfig.quizGameDefaultTableRankFontColor,
		public rankColorBackground1: string = AppConfig.quizGameDefaultTableRankBackgroundColor1,
		public rankColorBackground2: string = AppConfig.quizGameDefaultTableRankBackgroundColor2,
		public rankColorBackground3: string = AppConfig.quizGameDefaultTableRankBackgroundColor3,
		public rankColorBackground4: string = AppConfig.quizGameDefaultTableRankBackgroundColor4,
		public rankAniDuration: number = AppConfig.quizGameDefaultTableRankAniDuration,
		public rankRadius: number = AppConfig.quizGameDefaultTableRankRadiusPx,
		public rankBorder: number = AppConfig.quizGameDefaultTableRankBorderPx,
		public rankBorderColor: string = AppConfig.quizGameDefaultTableRankBorderColor
	)
	{
	}
	
	public static getModelFromJSON(jsonObj: any): QuizGameScreenQuizModel
	{
		if (!jsonObj)
		{
			return new QuizGameScreenQuizModel();
		}
		
		const model = new QuizGameScreenQuizModel(
			jsonObj['statusBarColorLine'] ?? AppConfig.quizGameDefaultFontColorMain,
			jsonObj['statusBarColorCorrect'] ?? AppConfig.quizGameDefaultColorCorrect,
			jsonObj['statusBarColorWrong'] ?? AppConfig.quizGameDefaultColorWrong,
			jsonObj['questionColor'] ?? AppConfig.quizGameDefaultFontColorMain,
			jsonObj['dialogResultTitleColor'] ?? AppConfig.quizGameDefaultFontColorMain,
			jsonObj['dialogResultStarColor'] ?? AppConfig.quizGameDefaultFontColorMain,
			jsonObj['dialogResultScoreColor'] ?? AppConfig.quizGameDefaultFontColorMain,
			jsonObj['imageSwipe'] ?? null,
			jsonObj['imageGreat'] ?? null,
			jsonObj['fontColorFeedback'] ?? AppConfig.quizGameDefaultFontColorMain,
			jsonObj['tableColorBgRowOdd'] ?? AppConfig.quizGameDefaultTableBackgroundRowOddColor,
			UtilObj.isset(jsonObj['tableRadius']) ? parseInt(jsonObj['tableRadius'], 10) : AppConfig.quizGameDefaultTableRadiusPx,
			UtilObj.isset(jsonObj['tableBorder']) ? parseInt(jsonObj['tableBorder'], 10) : AppConfig.quizGameDefaultTableBorderPx,
			jsonObj['tableBorderColor'] ?? AppConfig.quizGameDefaultTableBorderColor,
			jsonObj['fontColorRank'] ?? AppConfig.quizGameDefaultTableRankFontColor,
			jsonObj['rankColorBackground1'] ?? AppConfig.quizGameDefaultTableRankBackgroundColor1,
			jsonObj['rankColorBackground2'] ?? AppConfig.quizGameDefaultTableRankBackgroundColor2,
			jsonObj['rankColorBackground3'] ?? AppConfig.quizGameDefaultTableRankBackgroundColor3,
			jsonObj['rankColorBackground4'] ?? AppConfig.quizGameDefaultTableRankBackgroundColor4,
			UtilObj.isset(jsonObj['rankAniDuration']) ? parseInt(jsonObj['rankAniDuration'], 10) : AppConfig.quizGameDefaultTableRankAniDuration,
			UtilObj.isset(jsonObj['rankRadius']) ? parseInt(jsonObj['rankRadius'], 10) : AppConfig.quizGameDefaultTableRankRadiusPx,
			UtilObj.isset(jsonObj['rankBorder']) ? parseInt(jsonObj['rankBorder'], 10) : AppConfig.quizGameDefaultTableRankBorderPx,
			jsonObj['rankBorderColor'] ?? AppConfig.quizGameDefaultTableRankBorderColor
		);
		
		model.questionCard = ConfigContainerModel.getModelFromJSON(jsonObj['questionCard']);
		if (UtilObj.isset(jsonObj['questionCardGold']))
		{
			model.questionCardGold = ConfigContainerModel.getModelFromJSON(jsonObj['questionCardGold']);
		}
		if (UtilObj.isset(jsonObj['timeBar']))
		{
			model.timeBar = ConfigContainerModel.getModelFromJSON(jsonObj['timeBar']);
		}
		model.btnAnswer = ConfigButtonModel.getModelFromJSON(jsonObj['btnAnswer']);
		model.btnFeedback = ConfigButtonModel.getModelFromJSON(jsonObj['btnFeedback']);
		model.dialogWrong = ConfigContainerModel.getModelFromJSON(jsonObj['dialogWrong']);
		model.btnDialogWrong = ConfigButtonModel.getModelFromJSON(jsonObj['btnDialogWrong']);
		model.dialogResult = ConfigContainerModel.getModelFromJSON(jsonObj['dialogResult']);
		model.btnDialogResult = ConfigButtonModel.getModelFromJSON(jsonObj['btnDialogResult']);
		
		/*if (UtilObj.isset(jsonObj['radius']))
		{
			model.radius = parseInt(jsonObj['radius'], 10);
		}*/
		
		return model;
	}
}