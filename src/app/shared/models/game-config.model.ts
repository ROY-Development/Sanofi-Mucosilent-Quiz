import {UtilObj} from '../utils/util-obj';
import {UtilArray} from '../utils/util-array';
import {AppConfig} from '../../app.config';
import {QuizConfigCrmModel} from './quiz-config-crm.model';
import {BackgroundAnimationTypeEnum} from '../enums/background-animation-type.enum';
import {SplitScreenAnimationTypeEnum} from '../enums/split-screen-animation-type.enum';
import {ConfigButtonModel} from './config/config-button.model';
import {QuizGameScreenHighscoreModel} from './config/quiz-game-screen-highscore.model';
import {ConfigContainerModel} from './config/config-container.model';
import {QuizGameScreenQuizModel} from './config/quiz-game-screen-quiz.model';
import {QuizGameScreenMinigamesModel} from './config/quiz-game-screen-minigames.model';
import {QuizGameScreenEndGameModel} from './config/quiz-game-screen-end-game.model';
import {QuizGameScreenMgPachinkoModel} from './config/quiz-game-screen-mg-pachinko.model';
import {QuizGameScreenMgRouletteModel} from './config/quiz-game-screen-mg-roulette.model';
import {QuizGameScreenMgPointShooterModel} from './config/quiz-game-screen-mg-point-shooter.model';

export class GameConfigModel
{
	public get scormFinishQuestionCount(): number
	{
		// return Math.ceil(this.totalQuestions * this.scormQuestionFinishPercentage / 100);
		return Math.ceil(this.maxQuizRoundCount * this.maxQuizQuestionCount * this.scormQuestionFinishPercentage / 100);
	}
	
	constructor(
		public id: number,
		public isFtpReady: boolean = false,
		public companyPath: string,
		public quizGamePath: string,
		public titleAlignment: string,
		public titleFontSize: number,
		public titleLineHeight: number,
		public titleAni: number,
		public hasSubtitle: boolean,
		public includesHighscore: boolean,
		public mainFont: string,
		public fontColorTitle: string,
		public fontColorMain: string,
		public fontColorLink: string,
		public dialogColorBg: string,
		public fontColorDialog: string,
		public dialogRadius: number,
		public dialogBorder: number,
		public dialogBorderColor: string,
		public backgroundColorsDuration: number,
		public fontColorButton: string,
		public colorButtonBg: string,
		public buttonRadius: number,
		public buttonBorder: number,
		public buttonBorderColor: string,
		public fontColorIconButton: string,
		public colorIconButtonBg: string,
		public iconButtonRadius: number,
		public iconButtonBorder: number,
		public iconButtonBorderColor: string,
		public colorCategoryPath: string,
		public miniGameColorBackground1: string,
		public miniGameColorBackground2: string,
		public miniGameColorFont: string,
		public miniGameColorMain: string,
		public miniGameColorOutline: string,
		public miniGameColorBall: string,
		public backgroundColors: Array<string> | null,
		public backgroundAnimationImageUrls: Array<string> | null,
		public activeMiniGames: Array<number>,
		public maxQuizRoundCount: number,
		public maxQuizQuestionCount: number,
		public isRotatingFlyingAni: boolean,
		public backgroundAnimationType: BackgroundAnimationTypeEnum,
		public splitScreenAnimationType: SplitScreenAnimationTypeEnum,
		public splitScreenColorBg: string,
		public miniGameSplitScreenAnimationType: SplitScreenAnimationTypeEnum,
		public miniGameSplitScreenColorBg: string,
		public gameHeaderColorBg: string,
		public imageGameTitle: string | null = null,
		public imageBg: string | null = null,
		public imageScoreAni: string | null = null,
		public imageCompanyLogo: string | null = null,
		public urlCompany: string | null = null,
		public imageSplitScreenBg: string | null = null,
		public imageMiniGameSplitScreenBg: string | null = null,
		public typeImprint: string | null,
		public urlImprint: string | null,
		public typePrivacyPolicy: string | null,
		public urlPrivacyPolicy: string | null,
		public scormQuestionFinishPercentage: number,
		public totalQuestions: number,
		public soundDefinitions: Record<string, string> | null,
		public quizConfigCrm: QuizConfigCrmModel | null,
		public defaultBtn: ConfigButtonModel,
		public defaultBtnIcon: ConfigButtonModel,
		public startBtn: ConfigButtonModel,
		public screenTitleBtnDefault: ConfigButtonModel,
		public screenTitleBtnIcon: ConfigButtonModel,
		public headerBtnIcon: ConfigButtonModel,
		public headerContainerScore: ConfigContainerModel,
		public screenHighscore: QuizGameScreenHighscoreModel,
		public screenQuiz: QuizGameScreenQuizModel,
		public screenMinigames: QuizGameScreenMinigamesModel,
		public screenMgPachinko: QuizGameScreenMgPachinkoModel,
		public screenMgRoulette: QuizGameScreenMgRouletteModel,
		public screenMgPointShooter: QuizGameScreenMgPointShooterModel,
		public screenEndGame: QuizGameScreenEndGameModel,
		public screenEndGameBtnIcon: ConfigButtonModel
	)
	{
	}
	
	public static getModelFromJSON(jsonObj: any): GameConfigModel | null
	{
		if (!jsonObj)
		{
			return null;
		}
		
		const id: number = UtilObj.isset(jsonObj['id']) ? parseInt(jsonObj['id']) : 0;
		const companyPath: string = UtilObj.isset(jsonObj['companyPath']) ? jsonObj['companyPath'] : '';
		const quizGamePath: string = UtilObj.isset(jsonObj['quizGamePath']) ? jsonObj['quizGamePath'] : '';
		const backgroundAnimationImageUrls: Array<string> | null = UtilObj.isset(jsonObj['backgroundAnimationImageUrls']) && Array.isArray(jsonObj['backgroundAnimationImageUrls']) ?
			jsonObj['backgroundAnimationImageUrls'] : null;
		if (backgroundAnimationImageUrls)
		{
			for (const key in backgroundAnimationImageUrls)
			{
				const value: string = backgroundAnimationImageUrls[key];
				backgroundAnimationImageUrls[key] = quizGamePath + value;
			}
			
			UtilArray.shuffleArray(backgroundAnimationImageUrls);
		}
		let mainFont: string = '';
		if (jsonObj['mainFont'])
		{
			mainFont = companyPath + jsonObj['mainFont'];
		}
		
		const quizConfigCrm: QuizConfigCrmModel | null = QuizConfigCrmModel.getModelFromJSON(jsonObj.crm);
		
		// TODO use jsonObj.defaultBtn instead of defaultBtnJsonObj
		const defaultBtnJsonObj: any = {
			fontColor: jsonObj['fontColorButton'] ?? AppConfig.quizGameDefaultFontColorButton,
			colorBg: jsonObj['colorButtonBg'] ?? AppConfig.quizGameDefaultColorButtonBg,
			border: jsonObj['buttonBorder'] ? parseInt(jsonObj['buttonBorder']) : AppConfig.quizGameDefaultButtonBorderPx,
			borderColor: jsonObj['buttonBorderColor'] ?? AppConfig.quizGameDefaultButtonBorderColor
		};
		if (jsonObj['buttonRadius'])
		{
			defaultBtnJsonObj['radius'] = jsonObj['buttonRadius'] ? parseInt(jsonObj['buttonRadius']) : AppConfig.quizGameDefaultButtonRadiusPx;
		}
		const defaultBtn: ConfigButtonModel = ConfigButtonModel.getModelFromJSON(defaultBtnJsonObj);//jsonObj.defaultBtn);
		const defaultBtnIcon: ConfigButtonModel = ConfigButtonModel.getModelFromJSON(defaultBtnJsonObj);//jsonObj.defaultBtn);
		const startBtn: ConfigButtonModel = ConfigButtonModel.getModelFromJSON(jsonObj.startBtn);
		const screenTitleBtnDefault: ConfigButtonModel = ConfigButtonModel.getModelFromJSON(jsonObj.screenTitleBtnDefault);
		const screenTitleBtnIcon: ConfigButtonModel = ConfigButtonModel.getModelFromJSON(jsonObj.screenTitleBtnIcon);
		const headerBtnIcon: ConfigButtonModel = ConfigButtonModel.getModelFromJSON(jsonObj.headerBtnIcon);
		const headerContainerScore: ConfigContainerModel = ConfigContainerModel.getModelFromJSON(jsonObj.headerContainerScore);
		const screenHighscore: QuizGameScreenHighscoreModel = QuizGameScreenHighscoreModel.getModelFromJSON(jsonObj.screenHighscore);
		const screenQuiz: QuizGameScreenQuizModel = QuizGameScreenQuizModel.getModelFromJSON(jsonObj.screenQuiz);
		const screenMinigames: QuizGameScreenMinigamesModel = QuizGameScreenMinigamesModel.getModelFromJSON(jsonObj.screenMinigames);
		const screenMgPachinko: QuizGameScreenMgPachinkoModel = QuizGameScreenMgPachinkoModel.getModelFromJSON(jsonObj.screenMgPachinko);
		const screenMgRoulette: QuizGameScreenMgRouletteModel = QuizGameScreenMgRouletteModel.getModelFromJSON(jsonObj.screenMgRoulette);
		const screenMgPointShooter: QuizGameScreenMgPointShooterModel = QuizGameScreenMgPointShooterModel.getModelFromJSON(jsonObj.screenMgPointShooter);
		const screenEndGame: QuizGameScreenEndGameModel = QuizGameScreenEndGameModel.getModelFromJSON(jsonObj.screenEndGame);
		const screenEndGameBtnIcon: ConfigButtonModel = ConfigButtonModel.getModelFromJSON(jsonObj.screenEndGameBtnIcon);
		
		return new GameConfigModel(
			id,
			jsonObj['isFtpReady'] ?? false,
			companyPath,
			quizGamePath,
			jsonObj['titleAlignment'] ?? 'left',
			jsonObj['titleFontSize'] ? Math.round(jsonObj['titleFontSize']) : AppConfig.quizGameDefaultTitleFontSize,
			jsonObj['titleLineHeight'] ? parseFloat(jsonObj['titleLineHeight']) : AppConfig.quizGameDefaultTitleLineHeight,
			jsonObj['titleAni'] ? parseInt(jsonObj['titleAni']) : AppConfig.quizGameDefaultTitleAnimation,
			UtilObj.isset(jsonObj['hasSubtitle']) ? jsonObj['hasSubtitle'] : false,
			UtilObj.isset(jsonObj['includesHighscore']) ? jsonObj['includesHighscore'] : false,
			mainFont,
			jsonObj['fontColorTitle'] ?? '#1b3848',
			jsonObj['fontColorMain'] ?? '#ffffff',
			jsonObj['fontColorLink'] ?? '#ffffff',
			jsonObj['dialogColorBg'] ?? '#000000cc',
			jsonObj['fontColorDialog'] ?? '#ffffff',
			jsonObj['dialogRadius'] ? parseInt(jsonObj['dialogRadius']) : 0,
			jsonObj['dialogBorder'] ? parseInt(jsonObj['dialogBorder']) : 0,
			jsonObj['dialogBorderColor'] ?? '#000000',
			jsonObj['backgroundColorsDuration'] ? parseInt(jsonObj['backgroundColorsDuration']) : 25,
			jsonObj['fontColorButton'] ?? AppConfig.quizGameDefaultFontColorButton,
			jsonObj['colorButtonBg'] ?? AppConfig.quizGameDefaultColorButtonBg,
			jsonObj['buttonRadius'] ? parseInt(jsonObj['buttonRadius']) : AppConfig.quizGameDefaultButtonRadiusPx,
			jsonObj['buttonBorder'] ? parseInt(jsonObj['buttonBorder']) : AppConfig.quizGameDefaultButtonBorderPx,
			jsonObj['buttonBorderColor'] ?? AppConfig.quizGameDefaultButtonBorderColor,
			jsonObj['fontColorIconButton'] ?? AppConfig.quizGameDefaultFontColorButton,
			jsonObj['colorIconButtonBg'] ?? AppConfig.quizGameDefaultColorButtonBg,
			jsonObj['iconButtonRadius'] ? parseInt(jsonObj['iconButtonRadius']) : AppConfig.quizGameDefaultButtonRadiusPx,
			jsonObj['iconButtonBorder'] ? parseInt(jsonObj['iconButtonBorder']) : AppConfig.quizGameDefaultButtonBorderPx,
			jsonObj['iconButtonBorderColor'] ?? AppConfig.quizGameDefaultButtonBorderColor,
			jsonObj['colorCategoryPath'] ?? '#6c6cff',
			jsonObj['miniGameColorBackground1'] ?? '#00000080',
			jsonObj['miniGameColorBackground2'] ?? '#000000',
			jsonObj['miniGameColorFont'] ?? '#ffffff',
			jsonObj['miniGameColorMain'] ?? '#BB59F0',
			jsonObj['miniGameColorOutline'] ?? '#BB59F099',
			jsonObj['miniGameColorBall'] ?? '#ec6a1e',
			UtilObj.isset(jsonObj['backgroundColors']) && Array.isArray(jsonObj['backgroundColors']) ?
				jsonObj['backgroundColors'] : null,
			backgroundAnimationImageUrls,
			jsonObj['activeMiniGames'] ?? [],
			jsonObj['maxQuizRoundCount'] ?? AppConfig.maxQuizRoundCount,
			jsonObj['maxQuizQuestionCount'] ?? AppConfig.maxQuizQuestionCount,
			jsonObj['isRotatingFlyingAni'] ?? false,
			UtilObj.isset(jsonObj['backgroundAnimationType']) ?
				(jsonObj['backgroundAnimationType'] as BackgroundAnimationTypeEnum) :
				BackgroundAnimationTypeEnum.oneStep,
			UtilObj.isset(jsonObj['splitScreenAnimationType']) ?
				(jsonObj['splitScreenAnimationType'] as SplitScreenAnimationTypeEnum) :
				SplitScreenAnimationTypeEnum.diagonalLeftToRight,
			jsonObj['splitScreenColorBg'] ?? AppConfig.quizGameDefaultSplitScreenColorBg,
			UtilObj.isset(jsonObj['miniGameSplitScreenAnimationType']) ?
				(jsonObj['miniGameSplitScreenAnimationType'] as SplitScreenAnimationTypeEnum) :
				SplitScreenAnimationTypeEnum.diagonalLeftToRight,
			jsonObj['miniGameSplitScreenColorBg'] ?? AppConfig.quizGameDefaultSplitScreenColorBg,
			jsonObj['gameHeaderColorBg'] ?? AppConfig.quizGameDefaultGameHeaderColorBg,
			jsonObj['imageGameTitle'] ?? null,
			jsonObj['imageBg'] ?? null,
			jsonObj['imageScoreAni'] ?? null,
			jsonObj['imageCompanyLogo'] ?? null,
			jsonObj['urlCompany'] ?? null,
			jsonObj['imageSplitScreenBg'] ?? null,
			jsonObj['imageMiniGameSplitScreenBg'] ?? null,
			jsonObj['typeImprint'] ?? null,
			jsonObj['urlImprint'] ?? null,
			jsonObj['typePrivacyPolicy'] ?? null,
			jsonObj['urlPrivacyPolicy'] ?? null,
			UtilObj.isset(jsonObj['scormQuestionFinishPercentage']) ? parseFloat(jsonObj['scormQuestionFinishPercentage']) : 100,
			UtilObj.isset(jsonObj['totalQuestions']) ? parseFloat(jsonObj['totalQuestions']) : 0,
			jsonObj['soundDefinitions'] ?? null,
			quizConfigCrm,
			defaultBtn,
			defaultBtnIcon,
			startBtn,
			screenTitleBtnDefault,
			screenTitleBtnIcon,
			headerBtnIcon,
			headerContainerScore,
			screenHighscore,
			screenQuiz,
			screenMinigames,
			screenMgPachinko,
			screenMgRoulette,
			screenMgPointShooter,
			screenEndGame,
			screenEndGameBtnIcon
		);
	}
}