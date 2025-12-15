import {AppConfig} from '../../../app.config';
import {ConfigButtonModel} from './config-button.model';
import {ConfigContainerModel} from './config-container.model';

export class QuizGameScreenEndGameModel
{
	public dialogReview: ConfigContainerModel = ConfigContainerModel.getModelFromJSON({});
	public btnDialogReview: ConfigButtonModel = ConfigButtonModel.getModelFromJSON({});
	public btnDialogReviewCardCorrectFeedback: ConfigButtonModel = ConfigButtonModel.getModelFromJSON({});
	public btnDialogReviewCardWrongFeedback: ConfigButtonModel = ConfigButtonModel.getModelFromJSON({});
	public dialogReviewCardCorrect: ConfigContainerModel = ConfigContainerModel.getModelFromJSON({});
	public dialogReviewCardCorrectAnswerOptSel: ConfigContainerModel = ConfigContainerModel.getModelFromJSON({});
	public dialogReviewCardWrong: ConfigContainerModel = ConfigContainerModel.getModelFromJSON({});
	public dialogReviewCardWrongAnswerOptSel: ConfigContainerModel = ConfigContainerModel.getModelFromJSON({});
	
	constructor(
		public dialogReviewTitleColor: string = AppConfig.quizGameDefaultFontColorMain,
		public dialogReviewStarColor: string = AppConfig.quizGameDefaultFontColorMain,
		public dialogReviewRoundLabelColor: string = AppConfig.quizGameDefaultFontColorMain,
		public dialogReviewCatLabelColor: string = AppConfig.quizGameDefaultFontColorMain,
		
		public dialogReviewCardCorrectOptNotSelectedColor: string = AppConfig.quizGameDefaultFontColorMain,
		public dialogReviewCardCorrectFeedbackColor: string = AppConfig.quizGameDefaultFontColorMain,
		public dialogReviewCardCorrectResultColor: string = AppConfig.quizGameDefaultFontColorMain,
		public dialogReviewCardCorrectIconCorrectColor: string = AppConfig.quizGameDefaultFontColorMain,
		public dialogReviewCardCorrectIconWrongColor: string = AppConfig.quizGameDefaultFontColorMain,
		
		public dialogReviewCardWrongOptNotSelectedColor: string = AppConfig.quizGameDefaultFontColorMain,
		public dialogReviewCardWrongFeedbackColor: string = AppConfig.quizGameDefaultFontColorMain,
		public dialogReviewCardWrongResultColor: string = AppConfig.quizGameDefaultFontColorMain,
		public dialogReviewCardWrongIconCorrectColor: string = AppConfig.quizGameDefaultFontColorMain,
		public dialogReviewCardWrongIconWrongColor: string = AppConfig.quizGameDefaultFontColorMain,
	)
	{
	}
	
	public static getModelFromJSON(jsonObj: any): QuizGameScreenEndGameModel
	{
		if (!jsonObj)
		{
			return new QuizGameScreenEndGameModel();
		}
		
		const model = new QuizGameScreenEndGameModel(
			jsonObj['dialogReview'] ? (jsonObj['dialogReview']['titleColor'] ?? AppConfig.quizGameDefaultFontColorMain) : AppConfig.quizGameDefaultFontColorMain,
			jsonObj['dialogReview'] ? (jsonObj['dialogReview']['starColor'] ?? AppConfig.quizGameDefaultFontColorMain) : AppConfig.quizGameDefaultFontColorMain,
			jsonObj['dialogReview'] ? (jsonObj['dialogReview']['roundLabelColor'] ?? AppConfig.quizGameDefaultFontColorMain) : AppConfig.quizGameDefaultFontColorMain,
			jsonObj['dialogReview'] ? (jsonObj['dialogReview']['catLabelColor'] ?? AppConfig.quizGameDefaultFontColorMain) : AppConfig.quizGameDefaultFontColorMain,
			
			jsonObj['dialogReview'] ? (jsonObj['dialogReview']['cardCorrectOptNotSelectedColor'] ?? AppConfig.quizGameDefaultFontColorMain) : AppConfig.quizGameDefaultFontColorMain,
			jsonObj['dialogReview'] ? (jsonObj['dialogReview']['cardCorrectFeedbackColor'] ?? AppConfig.quizGameDefaultFontColorMain) : AppConfig.quizGameDefaultFontColorMain,
			jsonObj['dialogReview'] ? (jsonObj['dialogReview']['cardCorrectResultColor'] ?? AppConfig.quizGameDefaultFontColorMain) : AppConfig.quizGameDefaultFontColorMain,
			jsonObj['dialogReview'] ? (jsonObj['dialogReview']['cardCorrectIconCorrectColor'] ?? AppConfig.quizGameDefaultFontColorMain) : AppConfig.quizGameDefaultFontColorMain,
			jsonObj['dialogReview'] ? (jsonObj['dialogReview']['cardCorrectIconWrongColor'] ?? AppConfig.quizGameDefaultFontColorMain) : AppConfig.quizGameDefaultFontColorMain,
			
			jsonObj['dialogReview'] ? (jsonObj['dialogReview']['cardWrongOptNotSelectedColor'] ?? AppConfig.quizGameDefaultFontColorMain) : AppConfig.quizGameDefaultFontColorMain,
			jsonObj['dialogReview'] ? (jsonObj['dialogReview']['cardWrongFeedbackColor'] ?? AppConfig.quizGameDefaultFontColorMain) : AppConfig.quizGameDefaultFontColorMain,
			jsonObj['dialogReview'] ? (jsonObj['dialogReview']['cardWrongResultColor'] ?? AppConfig.quizGameDefaultFontColorMain) : AppConfig.quizGameDefaultFontColorMain,
			jsonObj['dialogReview'] ? (jsonObj['dialogReview']['cardWrongIconCorrectColor'] ?? AppConfig.quizGameDefaultFontColorMain) : AppConfig.quizGameDefaultFontColorMain,
			jsonObj['dialogReview'] ? (jsonObj['dialogReview']['cardWrongIconWrongColor'] ?? AppConfig.quizGameDefaultFontColorMain) : AppConfig.quizGameDefaultFontColorMain,
		);
		
		model.dialogReview = ConfigContainerModel.getModelFromJSON(jsonObj['dialogReview']);
		model.btnDialogReview = ConfigButtonModel.getModelFromJSON(jsonObj['btnDialogReview']);
		model.btnDialogReviewCardCorrectFeedback = ConfigButtonModel.getModelFromJSON(jsonObj['btnDialogReviewCardCorrectFeedback']);
		model.btnDialogReviewCardWrongFeedback = ConfigButtonModel.getModelFromJSON(jsonObj['btnDialogReviewCardWrongFeedback']);
		model.dialogReviewCardCorrect = ConfigContainerModel.getModelFromJSON(jsonObj['dialogReviewCardCorrect']);
		model.dialogReviewCardCorrectAnswerOptSel = ConfigContainerModel.getModelFromJSON(jsonObj['dialogReviewCardCorrectAnswerOptSel']);
		model.dialogReviewCardWrong = ConfigContainerModel.getModelFromJSON(jsonObj['dialogReviewCardWrong']);
		model.dialogReviewCardWrongAnswerOptSel = ConfigContainerModel.getModelFromJSON(jsonObj['dialogReviewCardWrongAnswerOptSel']);
		
		return model;
	}
}