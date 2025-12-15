import {LanguageEnum} from './shared/enums/language.enum';
import {AppRoutesEnum} from './app-routes.enum';
import {LocaleEnum} from './shared/enums/locale.enum';

export class AppConfig
{
	public static readonly startRoute: AppRoutesEnum = AppRoutesEnum.base;
	public static readonly startQuiz: number = 1;
	public static readonly areMiniGamesEnabled: boolean = true;
	public static readonly startMultiplierGame: number = 1;
	public static readonly areMultiplierGames: boolean = false;
	public static readonly maxMultiplierGameCount: number = 3;
	public static readonly maxQuizRoundCount: number = 3;
	public static readonly maxQuizQuestionCount: number = 5;
	public static readonly minCorrectComboCount: number = 3;
	public static readonly maxQuizQuestionTime: number = 15000;
	public static readonly isDebugConsole: boolean = false;
	public static readonly isInlineConsoleVisible: boolean = false;
	// public static readonly stillThereSeconds: number = 120;
	// public static readonly stillThereLastSeconds: number = 20;
	
	public static readonly defaultLanguage: LanguageEnum = LanguageEnum.de;
	public static readonly defaultLocale: LocaleEnum = LocaleEnum['en-main'];
	
	public static readonly requiredLanguages: Array<LanguageEnum> = [
		LanguageEnum.en
	];
	
	public static readonly languages: Array<LanguageEnum> = [
		LanguageEnum.en
	];
	
	public static readonly quizGameDefaultTitleAlignment: string = 'left';
	public static readonly quizGameDefaultTitleFontSize: number = 158;
	public static readonly quizGameDefaultTitleLineHeight: number = 0.75;
	public static readonly quizGameDefaultTitleAnimation: number = 0;
	public static readonly quizGameDefaultFontColorTitle: string = '#1b3848';
	public static readonly quizGameDefaultFontColorMain: string = '#ffffff';
	public static readonly quizGameDefaultFontColorLink: string = '#ffffff';
	public static readonly quizGameDefaultColorCorrect: string = '#258f50db';
	public static readonly quizGameDefaultColorWrong: string = '#ba2727d1';
	public static readonly quizGameDefaultBackgroundColor: string = '#53843f88';
	public static readonly quizGameDefaultContainerRadiusPx: number = 0;
	public static readonly quizGameDefaultContainerBorderPx: number = 0;
	public static readonly quizGameDefaultContainerBorderColor: string = '#000000';
	public static readonly quizGameDefaultTableBackgroundColor: string = '#ffffff17';
	public static readonly quizGameDefaultTableBackgroundRowOddColor: string = '#ffffff1a';
	public static readonly quizGameDefaultTableRadiusPx: number = 0;
	public static readonly quizGameDefaultTableBorderPx: number = 0;
	public static readonly quizGameDefaultTableBorderColor: string = '#000000';
	public static readonly quizGameDefaultTableRankFontColor: string = '#ffffff';
	public static readonly quizGameDefaultTableRankBackgroundColor1: string = '#71afa540';
	public static readonly quizGameDefaultTableRankBackgroundColor2: string = '#00897e1a';
	public static readonly quizGameDefaultTableRankBackgroundColor3: string = '#71afa540';
	public static readonly quizGameDefaultTableRankBackgroundColor4: string = '#00917e1a';
	public static readonly quizGameDefaultTableRankAniDuration: number = 2;
	public static readonly quizGameDefaultTableRankRadiusPx: number = 0;
	public static readonly quizGameDefaultTableRankBorderPx: number = 0;
	public static readonly quizGameDefaultTableRankBorderColor: string = '#000000';
	public static readonly quizGameDefaultFontColorButton: string = '#ffffff';
	public static readonly quizGameDefaultColorButtonBg: string = '#d4d4d442';
	public static readonly quizGameDefaultButtonRadiusPx: number = 0;
	public static readonly quizGameDefaultButtonBorderPx: number = 0;
	public static readonly quizGameDefaultButtonBorderColor: string = '#000000';
	public static readonly quizGameDefaultButtonGlowColor: string = '#ffffff';
	public static readonly quizGameDefaultButtonGlowRadiusPx: number = 1;
	public static readonly quizGameDefaultButtonGlowDuration: number = 0;
	public static readonly quizGameDefaultButtonStartGlowDuration: number = 2;
	public static readonly quizGameDefaultButtonPulseScale: number = 0.95;
	public static readonly quizGameDefaultButtonPulseDuration: number = 2.5;
	public static readonly quizGameDefaultFontColorIconButton: string = '#ffffff';
	public static readonly quizGameDefaultColorIconButtonBg: string = '#d4d4d442';
	public static readonly quizGameDefaultIconButtonRadiusPx: number = 0;
	public static readonly quizGameDefaultIconButtonBorderPx: number = 0;
	public static readonly quizGameDefaultIconButtonBorderColor: string = '#000000';
	public static readonly quizGameDefaultMinigameMainColor: string = '#BB59F0';
	public static readonly quizGameDefaultMinigameMainColorA02: string = '#BB59F033';
	public static readonly quizGameDefaultMinigameMainColorA03: string = '#BB59F04D';
	public static readonly quizGameDefaultMinigameMainColorA06: string = '#BB59F099';
	public static readonly quizGameDefaultMinigameMainColorA08: string = '#BB59F0CC';
	public static readonly quizGameDefaultMinigameFontColor: string = '#ffffff';
	public static readonly quizGameDefaultMinigameBackgroundColor1: string = '#00000080';
	public static readonly quizGameDefaultMinigameBackgroundColor2: string = '#000000';
	public static readonly quizGameDefaultMinigameBallHolderShotColor: string = '#59187a';
	public static readonly quizGameDefaultMinigameTargetBackgroundColor: string = '#53535380';
	public static readonly quizGameDefaultMinigameTargetBackgroundColor2: string = '#59187a';
	public static readonly quizGameDefaultMinigameTargetHoleBackgroundColor: string = '#00000000';
	public static readonly quizGameDefaultMinigameObstacleBackgroundColor: string = '#00000000';
	public static readonly quizGameDefaultMinigameOutlineColor: string = '#BB59F099';
	public static readonly quizGameDefaultMinigameBallColor: string = '#ec6a1e';
	public static readonly quizGameDefaultMinigameBallLightColor: string = '#ec6a1e4c';
	public static readonly quizGameDefaultSplitScreenColorBg: string = '#d4d4d442';
	public static readonly quizGameDefaultGameHeaderColorBg: string = '#ffffff4d';
}