import {EventEmitter, inject, Injectable, signal} from '@angular/core';
import {QuestionConfigModel} from '../models/question-config.model';
import {UtilArray} from '../../../shared/utils/util-array';
import {AnswerConfigModel} from '../models/answer-config.model';
import {AppConfig} from '../../../app.config';
import {NativeTranslateService} from '../../../core/services/native-translate.service';
import {BackgroundAnimationTypeEnum} from '../../../shared/enums/background-animation-type.enum';
import {UtilObj} from '../../../shared/utils/util-obj';
import {QuizGameScreenQuizModel} from '../../../shared/models/config/quiz-game-screen-quiz.model';

@Injectable({
	providedIn: 'root'
})
export class SwipeYesNoService
{
	private nativeTranslateService = inject(NativeTranslateService);
	
	public static readonly maxTimerMSec: number = AppConfig.maxQuizQuestionTime;
	
	public readonly signalQuestionText = signal<string>('');
	public readonly signalQuestionColor = signal<string>(AppConfig.quizGameDefaultFontColorMain);
	public readonly signaStatusBarColorLine = signal<string>(AppConfig.quizGameDefaultFontColorMain);
	public readonly signaStatusBarColorCorrect = signal<string>(AppConfig.quizGameDefaultColorCorrect);
	public readonly signaStatusBarColorWrong = signal<string>(AppConfig.quizGameDefaultColorWrong);
	public readonly signalTimeBarColor = signal<string>('#fff');
	public readonly signalRemainingTimeRank = signal<number>(0);
	
	public readonly signalAnswerTimerMSec = signal<number>(0);
	public readonly signalAnswerTimerFactor = signal<number>(0);
	public readonly signalIsAnswerTimerRunning = signal<boolean>(false);
	public readonly signalIsAnswerTimerFinished = signal<boolean>(false);
	public readonly signalAnswerSelectedCorrect = signal<boolean | null>(null);
	
	public readonly signalIsShowingSwipeImage = signal<boolean>(false);
	public readonly signalHasSwiped = signal<boolean>(false);
	
	public readonly signalGoldenCardImage = signal<string>(
		`radial-gradient(ellipse farthest-corner at right bottom, #FEDB37 0%, #FDB931 8%, #9f7928 30%, #8A6E2F 40%, transparent 80%),
				radial-gradient(ellipse farthest-corner at left top, #FFFFFF 0%, #FFFFAC 8%, #D1B464 25%, #5d4a1f 62.5%, #5d4a1f 100%)`);
	
	public readonly timeBarColors: Array<string> = ['#72a878', '#ac7a29', '#bf5832', '#ca3434'];
	
	// only used by quiz game editor
	public readonly signalIsEditorCallGoldenCard = signal<boolean>(false);
	public readonly signalIsEditorShowingCorrectScreen = signal<boolean>(false);
	
	public readonly rerenderEmitter: EventEmitter<string | null> = new EventEmitter<string | null>();
	
	// helps to use everytime the category config in the base game
	public isStandardBaseGame: boolean = false;
	
	public currentQuestionNr: number = 0;
	public maxQuestionCount: number = 0;//AppConfig.questionOrderList.length;
	
	public categoryKey: string | null = null;
	public backgroundImageUrl: string | null = null;
	public backgroundColors: Array<string> | null = null;
	public backgroundColorsDuration: number | null = null;
	public backgroundAnimationImageUrls: Array<string> | null = null;
	public backgroundAnimationType: BackgroundAnimationTypeEnum = BackgroundAnimationTypeEnum.oneStep;
	public answerList: Array<AnswerConfigModel> = [];
	public questionList: Array<QuestionConfigModel> = [];
	
	private globalQuestionText: string = '';
	
	// prepare question color
	public questionColorConfig: {
		global: string;
		category: string | null;
		question: string | null;
	} = {
		global: '#fff',
		category: null,
		question: null
	};
	
	public statusBarColorLineConfig: {
		global: string;
	} = {global: AppConfig.quizGameDefaultFontColorMain};
	public statusBarColorCorrectConfig: {
		global: string;
	} = {global: AppConfig.quizGameDefaultColorCorrect};
	public statusBarColorWrongConfig: {
		global: string;
	} = {global: AppConfig.quizGameDefaultColorWrong};
	
	private initCount: number = 0;
	
	public init(config: any, maxQuizQuestionCount: number): void
	{
		const answerList: Array<any> = config.answers ?? [];
		const questionList: Array<any> = config.questions;
		
		this.categoryKey = config.categoryKey ?? null;
		
		if (this.categoryKey)
		{
			const localizationKey: string = 'quiz-' + this.categoryKey;
			const questionText: string = this.nativeTranslateService.instant(localizationKey);
			if (questionText !== localizationKey)
			{
				this.globalQuestionText = questionText;
			}
			else
			{
				this.globalQuestionText = this.nativeTranslateService.instant('statement-correct-or-not-correct');
			}
		}
		
		// special values for the quiz editor
		const hasOverridingValues: boolean = UtilObj.isset(config.hasOverridingValues) && config.hasOverridingValues === true;
		
		if (this.isStandardBaseGame || hasOverridingValues)
		{
			this.questionColorConfig.category = config.questionColor ? config.questionColor : null;
			
			this.backgroundColors = config.backgroundColors && Array.isArray(config.backgroundColors) ? config.backgroundColors : null;
			this.backgroundColorsDuration = config.backgroundColorsDuration ? config.backgroundColorsDuration : null;
		}
		else
		{
			this.questionColorConfig.category = null;
			
			this.backgroundColors = null;
			this.backgroundColorsDuration = null;
		}
		
		this.backgroundImageUrl = config.backgroundImageUrl ?? null;
		
		this.backgroundAnimationImageUrls =
			config.backgroundAnimationImageUrls && Array.isArray(config.backgroundAnimationImageUrls) ?
				config.backgroundAnimationImageUrls : null;
		if (this.backgroundAnimationImageUrls)
		{
			UtilArray.shuffleArray(this.backgroundAnimationImageUrls);
		}
		
		this.backgroundAnimationType = UtilObj.isset(config.backgroundAnimationType) ?
			(config.backgroundAnimationType as BackgroundAnimationTypeEnum) :
			BackgroundAnimationTypeEnum.oneStep;
		/*	if (this.initCount % 3 === 2)
			{
				this.backgroundAnimationImageUrls?.unshift('assets/images/icons/flying/ROY_Jannis.png');
			}*/
		this.initCount++;
		
		this.answerList = AnswerConfigModel.getListFromJSON(answerList);
		this.questionList = QuestionConfigModel.getListFromJSON(questionList);
		this.questionList = UtilArray.shuffleArray(this.questionList);
		if (this.questionList.length > maxQuizQuestionCount)
		{
			this.questionList = this.questionList.slice(0, maxQuizQuestionCount);
		}
		// console.log(this.questionList);
		
		// don't mix answers because of defined images with direction
		/*for (const qConfig of this.questionList)
		{
			qConfig.answerConfigs = UtilArray.shuffleArray(qConfig.answerConfigs);
		}*/
		
		this.signalTimeBarColor.set('#fff');
		this.signalRemainingTimeRank.set(0);
		this.signalAnswerTimerMSec.set(0);
		this.signalAnswerTimerFactor.set(0);
		this.signalIsAnswerTimerRunning.set(false);
		this.signalIsAnswerTimerFinished.set(false);
		this.signalAnswerSelectedCorrect.set(null);
		this.signalIsShowingSwipeImage.set(false);
		this.signalHasSwiped.set(false);
		// console.log(this.questionList)
	}
	
	public triggerRerender(editorKey: string | null = null): void
	{
		this.rerenderEmitter.emit(editorKey);
	}
	
	public updateGoldenCardImage(color1: string, color2: string, color3: string, color4: string, color5: string): void
	{
		this.signalGoldenCardImage.set(`radial-gradient(ellipse farthest-corner at right bottom, ${color1} 0%, ${color2} 8%, ${color3} 30%, ${color4} 40%, ${color5} 80%),
				radial-gradient(ellipse farthest-corner at left top, ${color1} 0%, ${color2} 8%, ${color3} 25%, ${color4} 62.5%, ${color5} 100%)`)
	}
	
	public updateGlobalSettingsFromGameConfig(quizGameScreenQuiz: QuizGameScreenQuizModel): void
	{
		this.questionColorConfig.global = quizGameScreenQuiz.questionColor;
		this.statusBarColorLineConfig.global = quizGameScreenQuiz.statusBarColorLine;
		this.statusBarColorCorrectConfig.global = quizGameScreenQuiz.statusBarColorCorrect;
		this.statusBarColorWrongConfig.global = quizGameScreenQuiz.statusBarColorWrong;
	}
	
	public updateStyles(): void
	{
		if (this.questionColorConfig.question && this.signalQuestionColor() !== this.questionColorConfig.question)
		{
			// console.log('use special color: ' + this.specialQuestionColor)
			this.signalQuestionColor.set(this.questionColorConfig.question);
		}
		else if (this.questionColorConfig.category && this.signalQuestionColor() !== this.questionColorConfig.category)
		{
			// console.log('use special category question color: ' + this.specialCategoryQuestionColor)
			this.signalQuestionColor.set(this.questionColorConfig.category);
		}
		else if (this.signalQuestionColor() !== this.questionColorConfig.global)
		{
			// console.log('use global color: ' + this.globalQuestionColor)
			this.signalQuestionColor.set(this.questionColorConfig.global);
		}
		
		if (this.signaStatusBarColorLine() !== this.statusBarColorLineConfig.global)
		{
			this.signaStatusBarColorLine.set(this.statusBarColorLineConfig.global);
		}
		if (this.signaStatusBarColorCorrect() !== this.statusBarColorCorrectConfig.global)
		{
			this.signaStatusBarColorCorrect.set(this.statusBarColorCorrectConfig.global);
		}
		if (this.signaStatusBarColorWrong() !== this.statusBarColorWrongConfig.global)
		{
			this.signaStatusBarColorWrong.set(this.statusBarColorWrongConfig.global);
		}
	}
	
	public updateQuestionConfigValues(questionConfig: QuestionConfigModel, id: number): void
	{
		if (questionConfig.questionColor) // per question
		{
			this.questionColorConfig.question = questionConfig.questionColor;
		}
		else
		{
			this.questionColorConfig.question = null;
		}
		this.updateStyles();
		
		if (this.categoryKey)
		{
			const localizationKey: string = 'quiz-' + this.categoryKey + '-' + id;
			const questionText: string = this.nativeTranslateService.instant(localizationKey);
			if (questionText !== localizationKey)
			{
				this.signalQuestionText.set(questionText);
			}
			else
			{
				this.signalQuestionText.set(this.globalQuestionText);
			}
		}
	}
	
	public startTimer(): void
	{
		this.signalAnswerTimerMSec.set(SwipeYesNoService.maxTimerMSec);
		this.signalAnswerTimerFactor.set(1);
		this.signalIsAnswerTimerRunning.set(true);
		
		if (!this.signalHasSwiped())
		{
			this.signalIsShowingSwipeImage.set(true);
		}
	}
	
	public stopTimer(): void
	{
		this.signalIsAnswerTimerRunning.set(false);
		this.signalIsAnswerTimerFinished.set(false);
		
		this.signalIsShowingSwipeImage.set(false);
	}
	
	public getNextQuestionId(currentQuestionId: number | null): number | null
	{
		let id: number = 0;
		
		for (let i: number = 0, n = this.questionList.length; i < n; ++i)
		{
			id = this.questionList[i].id;
			if (id === currentQuestionId && i + 1 < this.questionList.length)
			{
				return this.questionList[i + 1].id;
			}
		}
		
		// first time selection
		if (currentQuestionId === null && this.questionList.length > 0)
		{
			return this.questionList[0].id;
		}
		
		return null;
	}
	
	public getQuestion(id: number): QuestionConfigModel | null
	{
		for (const value of this.questionList)
		{
			if (value.id === id)
			{
				return value;
			}
		}
		
		return null;
	}
	
	private getRemainingTimeRank(): number
	{
		const remainingTimeFactor: number = this.signalAnswerTimerFactor();
		if (remainingTimeFactor > 3 / 4)
		{
			return 3;
		}
		else if (remainingTimeFactor > 1 / 2)
		{
			return 2;
		}
		else if (remainingTimeFactor > 1 / 4)
		{
			return 1;
		}
		
		return 0;
	}
	
	public updateCurrentQuestionNumber(questionId: number): void
	{
		for (let i: number = 0, n = this.questionList.length; i < n; ++i)
		{
			if (this.questionList[i].id === questionId)
			{
				this.currentQuestionNr = i + 1;
			}
		}
	}
	
	public update(delta: number): void
	{
		if (!this.signalIsAnswerTimerRunning())
		{
			return;
		}
		
		let timerMSec: number = this.signalAnswerTimerMSec();
		
		if (timerMSec > 0)
		{
			timerMSec -= delta;
			
			if (timerMSec <= 0)
			{
				timerMSec = 0;
				
				// finished timer
				this.signalIsAnswerTimerRunning.set(false);
				this.signalIsAnswerTimerFinished.set(true);
			}
			
			this.signalAnswerTimerMSec.set(timerMSec);
			this.signalAnswerTimerFactor.set(timerMSec / SwipeYesNoService.maxTimerMSec);
			
			const remainingTimeRank: number = this.getRemainingTimeRank();
			if (this.signalRemainingTimeRank() !== remainingTimeRank)
			{
				this.signalRemainingTimeRank.set(remainingTimeRank);
				
				if (remainingTimeRank === 3)
				{
					this.signalTimeBarColor.set(this.timeBarColors[0]);
				}
				else if (remainingTimeRank === 2)
				{
					this.signalTimeBarColor.set(this.timeBarColors[1]);
				}
				else if (remainingTimeRank === 1)
				{
					this.signalTimeBarColor.set(this.timeBarColors[2]);
				}
				else if (remainingTimeRank === 0)
				{
					this.signalTimeBarColor.set(this.timeBarColors[3]);
				}
			}
		}
	}
}
