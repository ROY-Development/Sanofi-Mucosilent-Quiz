import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	inject,
	OnDestroy,
	OnInit,
	signal,
	ViewChild
} from '@angular/core';
import {UserGameService} from '../../core/services/user-game.service';
import {InitService} from '../../core/services/init.service';
import {AppRoutesEnum} from '../../app-routes.enum';
import {SoundService} from '../../core/services/sound.service';
import {UtilTimeout} from '../../shared/utils/util-timeout';
import {UserBackendService} from '../../core/services/user-backend.service';
import {UntilDestroy} from '@ngneat/until-destroy';
import {GameService} from '../../core/services/game.service';
import {GameCoinsService} from '../../core/services/game-coins.service';
import {GameHeaderService} from '../../core/services/game-header.service';
import {AppConfig} from '../../app.config';
import {TopicQuestionResultModel} from '../../shared/models/topic-question-result.model';
import {SoundNameEnum} from '../../shared/enums/sound-name.enum';
import {Subscription} from 'rxjs';
import {SelectedAnswerModel} from '../../games/swipe-yes-no/models/selected-answer.model';
import {
	AniSplitScreenTitleComponent
} from '../../shared/components/ani-split-screen-title/ani-split-screen-title.component';
import {SwipeYesNoComponent} from '../../games/swipe-yes-no/swipe-yes-no.component';
import {ImageLoadService} from '../../core/services/image-load.service';
import {SplitScreenAnimationTypeEnum} from '../../shared/enums/split-screen-animation-type.enum';
import {
	AniSplitScreenTitleService
} from '../../shared/components/ani-split-screen-title/ani-split-screen-title.service';

@UntilDestroy()
@Component({
	selector: 'app-game-page',
	templateUrl: './game-page.component.html',
	styleUrls: ['./game-page.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: false
})
export class GamePageComponent implements OnInit, AfterViewInit, OnDestroy
{
	protected gameService = inject(GameService);
	protected userGameService = inject(UserGameService);
	protected initService = inject(InitService);
	protected userBackendService = inject(UserBackendService);
	private gameCoinsService = inject(GameCoinsService);
	private gameHeaderService = inject(GameHeaderService);
	private aniSplitScreenTitleService = inject(AniSplitScreenTitleService);
	private soundService = inject(SoundService);
	private imageLoadService = inject(ImageLoadService);
	
	@ViewChild('swipeYesNoComponent') protected readonly swipeYesNoComponent?: SwipeYesNoComponent;
	@ViewChild('aniSplitScreenTitleComponent') protected readonly aniSplitScreenTitleComponent?: AniSplitScreenTitleComponent;
	
	public currentQuestionId: number | null = null;
	protected readonly signalCategoryKeyName = signal<string>('test');
	protected readonly signalCorrectComboCount = signal<number>(0);
	protected readonly signalSplitScreenAnimationType = signal<SplitScreenAnimationTypeEnum>(SplitScreenAnimationTypeEnum.diagonalLeftToRight);
	protected readonly signalSplitScreenColorBg = signal<string>(AppConfig.quizGameDefaultSplitScreenColorBg);
	protected readonly signalSplitScreenBackgroundImage = signal<string>('none');
	protected readonly signalIsShowingTaskSolvedDialog = signal<boolean>(false);
	protected readonly signalMaxQuizQuestionCount = signal<number>(AppConfig.maxQuizQuestionCount);
	
	private backgroundSoundTimeoutSubscription: Subscription | null = null;
	private finishGameTimeoutSubscription: Subscription | null = null;
	private splitScreenRestartEventSubscription: Subscription | null = null;
	
	protected runtime: number = 0;
	protected wasLastGame: boolean = false;
	
	protected readonly SplitScreenAnimationTypeEnum = SplitScreenAnimationTypeEnum;
	
	constructor()
	{
		const userBackendService = this.userBackendService;
		
		this.currentQuestionId = userBackendService.signalUserBackend() && userBackendService.signalUserBackend()?.meta ?
			userBackendService.signalUserBackend()!.meta! : null;
	}
	
	public ngOnInit(): void
	{
		//	this.soundService.playBackgroundSound('taskMusic');
		
		// const songNr: string = UtilString.addLeadingZeros(Math.min(this.gameService.signalQuizNumber(), 3), 2);
		const songName: SoundNameEnum = SoundNameEnum.mainMusic01; // ('mainMusic' + songNr) as SoundNameEnum;
		
		if (this.gameService.signalGameConfig())
		{
			this.signalMaxQuizQuestionCount.set(this.gameService.signalGameConfig()!.maxQuizQuestionCount);
		}
		
		if (this.gameService.currentTopic)
		{
			this.signalCategoryKeyName.set('quiz-' + this.gameService.currentTopic.name);
		}
		// Fallback for directly starting route AppRoutesEnum.game
		else
		{
			this.gameService.init();
			this.gameService.setCurrentTopic(AppConfig.startQuiz);
		}
		
		this.soundService.fadeOutSound(SoundNameEnum.introMusic, 2000);
		this.backgroundSoundTimeoutSubscription = UtilTimeout.setTimeout(
			() => {
				this.backgroundSoundTimeoutSubscription = null;
				this.soundService.playBackgroundSound(songName);
			}, 1600// 500
		);
		
		this.updateSplitScreenBg('start');
		// restart the split-screen animation from the quiz game editor event
		this.splitScreenRestartEventSubscription = this.aniSplitScreenTitleService.eventEmitter.subscribe((event: string) => {
			this.updateSplitScreenBg(event);
		});
		/*
		UtilTimeout.setTimeout(() => {
			for (let i = 0; i < 5; i++)
			{
				const topicQuestionResult: TopicQuestionResultModel = new TopicQuestionResultModel(
					123, 2, 0, 332, 5, true, true, '', '', ''
				);
				this.gameService.addTopicQuestionScore(topicQuestionResult);
				this.userGameService.addScore(123);
			}
			
			this.onFinishGame(true, 1)
		}, 300)*/
	}
	
	public ngAfterViewInit(): void
	{
		UtilTimeout.setTimeout(() => {
			this.soundService.playSound(SoundNameEnum.modalFadeOut, true);
			this.aniSplitScreenTitleComponent?.toggle();
			
			this.gameService.setIsGameRunning(true);
			
			this.swipeYesNoComponent?.startGame();
		}, 1600);
	}
	
	public ngOnDestroy(): void
	{
		if (this.backgroundSoundTimeoutSubscription)
		{
			this.backgroundSoundTimeoutSubscription.unsubscribe();
			this.backgroundSoundTimeoutSubscription = null;
		}
		
		if (this.finishGameTimeoutSubscription)
		{
			this.finishGameTimeoutSubscription.unsubscribe();
			this.finishGameTimeoutSubscription = null;
		}
		
		if (this.splitScreenRestartEventSubscription)
		{
			this.splitScreenRestartEventSubscription.unsubscribe();
			this.splitScreenRestartEventSubscription = null;
		}
	}
	
	private updateSplitScreenBg(event: string): void
	{
		let animationType: SplitScreenAnimationTypeEnum | null = null;
		let colorBg: string | null = null;
		let image: HTMLImageElement | null = null;
		
		if (event !== 'restart')
		{
			if (this.gameService.currentTopic?.categorySplitScreenConfig?.animationType)
			{
				animationType = this.gameService.currentTopic.categorySplitScreenConfig.animationType;
			}
			
			if (this.gameService.currentTopic?.categorySplitScreenConfig?.backgroundColor)
			{
				colorBg = this.gameService.currentTopic.categorySplitScreenConfig.backgroundColor;
			}
			
			if (this.gameService.currentTopic?.categorySplitScreenConfig?.backgroundImageUrl)
			{
				image = this.imageLoadService.getImage(this.gameService.currentTopic.name + 'SplitScreenBgImage');
			}
		}
		
		if (!animationType)
		{
			animationType = this.gameService.signalGameConfig()?.splitScreenAnimationType ?? SplitScreenAnimationTypeEnum.diagonalLeftToRight;
		}
		
		this.signalSplitScreenAnimationType.set(animationType);
		
		if (!colorBg)
		{
			colorBg = this.gameService.signalGameConfig()?.splitScreenColorBg ?? '#d4d4d442';
		}
		
		this.signalSplitScreenColorBg.set(colorBg);
		
		// only use base image if there is no overwriting configuration from category
		if (!image && !this.gameService.currentTopic?.categorySplitScreenConfig)
		{
			image = this.imageLoadService.getImage('splitScreenBgImage');
		}
		
		if (image)
		{
			this.signalSplitScreenBackgroundImage.set(`url('${image.src}')`);
		}
		else
		{
			this.signalSplitScreenBackgroundImage.set('none');
		}
	}
	
	public selectAnswerEvent(selectedAnswer: SelectedAnswerModel): void
	{
		if (AppConfig.isDebugConsole)
		{
			console.log(selectedAnswer);
		}
		
		/*if (
			this.initService.appQueryParams.userId.length <= 0 ||
			this.initService.appQueryParams.userId === '-1'
		)
		{
			console.warn('No user id is set.');
			return;
		}*/
		
		if (selectedAnswer.isSelectedCorrect)
		{
			let score: number = 250;
			let coinsCount: number = 10;
			
			if (this.gameService.currentQuestionIndex === this.gameService.goldenQuestionIndex)
			{
				score = 500;
				coinsCount = 30;
			}
			
			let totalScore: number = score;
			let remainingTimeScore: number = 0;
			let text: string;
			
			if (selectedAnswer.remainingTimeRank === 3)
			{
				text = 'superschnell';
				remainingTimeScore = 50;
			}
			else if (selectedAnswer.remainingTimeRank === 2)
			{
				text = 'schnell';
				remainingTimeScore = 25;
			}
			else if (selectedAnswer.remainingTimeRank === 1)
			{
				text = 'mittel-schnell';
				remainingTimeScore = 10;
			}
			else
			{
				text = 'langsam';
			}
			
			// add a bonus score for the remaining time factor 2025-11-05
			remainingTimeScore += Math.round(150 * selectedAnswer.remainingTimeFactor);
			
			totalScore += remainingTimeScore;
			
			if (AppConfig.isDebugConsole)
			{
				console.log(
					text,
					'remainingTimeFactor:', selectedAnswer.remainingTimeFactor,
					'remainingTimeScore:', remainingTimeScore,
					'totalScore', totalScore
				);
			}
			
			const topicQuestionResult: TopicQuestionResultModel = new TopicQuestionResultModel(
				this.gameService.signalQuizNumber(),
				score,
				remainingTimeScore,
				0,
				totalScore,
				selectedAnswer.remainingTimeFactor,
				selectedAnswer.isLeftCorrect,
				selectedAnswer.isSelectedLeft,
				selectedAnswer.isSelectedCorrect,
				selectedAnswer.categoryLocalisationKey,
				selectedAnswer.questionLocalisationKey,
				selectedAnswer.feedbackLocalisationKey,
				selectedAnswer.answerLeftLocalisationKey,
				selectedAnswer.answerRightLocalisationKey
			);
			this.gameService.addTopicQuestionScore(topicQuestionResult);
			this.userGameService.addScore(totalScore);
			
			const targetX: number = 784;
			const targetY: number = 54;
			
			if (selectedAnswer.remainingTimeFactor > 2 / 3 && selectedAnswer.superfastPosition)
			{
				this.gameCoinsService.start(selectedAnswer.superfastPosition.x, selectedAnswer.superfastPosition.y, targetX, targetY, 4, null, null);
			}
			
			this.gameHeaderService.prepareGameScore(this.userGameService.signalGameScore().score);
			this.gameCoinsService.start(selectedAnswer.btnPosition.x, selectedAnswer.btnPosition.y, targetX, targetY, coinsCount, () => {
					// console.log('onShrink')
					this.gameHeaderService.updateGameScore();
				}, () => {
					// console.log('onComplete')
				}
			);
			
			const correctComboCount: number = this.gameService.getCorrectComboCount();
			const isShowingCombo: boolean = correctComboCount >= AppConfig.minCorrectComboCount;
			
			if (isShowingCombo)
			{
				this.signalCorrectComboCount.set(correctComboCount);
				
				let comboScore: number;
				// yes, this is only prepared for different scores
				// combo 3 = 100, 4 = 100, 5 = 100
				if (correctComboCount === 3)
				{
					comboScore = 100;
				}
				else if (correctComboCount === 4)
				{
					comboScore = 100;
				}
				else if (correctComboCount === 5)
				{
					comboScore = 100;
				}
				else
				{
					comboScore = 100;
				}
				
				this.gameService.updateLastTopicQuestionComboScore(comboScore);
				this.userGameService.addScore(comboScore);
				
				if (selectedAnswer.comboPosition)
				{
					this.gameHeaderService.prepareGameScore(this.userGameService.signalGameScore().score);
					this.gameCoinsService.start(selectedAnswer.comboPosition.x, selectedAnswer.comboPosition.y, targetX, targetY, 4, () => {
						// console.log('onShrink')
						this.gameHeaderService.updateGameScore();
					}, null);
				}
			}
		}
		else
		{
			const topicQuestionResult: TopicQuestionResultModel = new TopicQuestionResultModel(
				this.gameService.signalQuizNumber(),
				0,
				0,
				0,
				0,
				selectedAnswer.remainingTimeFactor,
				selectedAnswer.isLeftCorrect,
				selectedAnswer.isSelectedLeft,
				selectedAnswer.isSelectedCorrect,
				selectedAnswer.categoryLocalisationKey,
				selectedAnswer.questionLocalisationKey,
				selectedAnswer.feedbackLocalisationKey,
				selectedAnswer.answerLeftLocalisationKey,
				selectedAnswer.answerRightLocalisationKey
			);
			this.gameService.addTopicQuestionScore(topicQuestionResult);
			this.signalCorrectComboCount.set(0);
		}
		
		// set the current question correct rate
		const correctGameQuestionsRate: number = this.gameService.getCorrectGameQuestionsRate();
		this.userGameService.setCorrectRate(correctGameQuestionsRate);
		
		/*this.userBackendService.save(
			this.initService.appQueryParams.userId,
			acId,
			this.initService.appQueryParams.market,
			this.initService.appQueryParams.localeRaw,
			questionId,
			isSelectedCorrect
		).pipe(untilDestroyed(this)).subscribe({
			next: (value) => {
				console.log(value)
			},
			error: this.onError.bind(this)
		});*/
	}
	
	public onFinishGame(isSuccess: boolean, runtime: number): void
	{
		if (AppConfig.isDebugConsole)
		{
			console.log('onFinishGame quiz:', this.gameService.signalQuizNumber(), 'isSuccess:', isSuccess);
		}
		
		const maxQuizRoundCount: number = this.gameService.signalGameConfig() ?
			this.gameService.signalGameConfig()!.maxQuizRoundCount : AppConfig.maxQuizRoundCount;
		const wasLastGame: boolean = this.gameService.signalQuizNumber() >= maxQuizRoundCount;
		
		this.finishGameTimeoutSubscription = UtilTimeout.setTimeout(() => {
			this.finishGameTimeoutSubscription = null;
			
			this.gameService.setIsGameRunning(false);
			//this.initService.navigateToRoute(AppRoutesEnum.gameMultiplier).then();
			
			/*this.soundService.fadeOutSound('taskMusic', 400, StopTypeEnum.stop);
			this.soundService.playSound('taskFinish', true);
			
			//this.userGameScoreService.calculateTaskTokens(this.userGameService.signalTaskNumber(), runtime);
			*/
			
			this.runtime = runtime;
			this.wasLastGame = wasLastGame;
			
			this.signalIsShowingTaskSolvedDialog.set(true);
			this.soundService.playSound('modalFadeIn', true);
			
			// show a modal dialog and after closing, update the score and do this:
			/*		this.modalService.openModalDialog(
						ModalTaskSolvedComponent,
						() => {
						},
						ModalSizeEnum.fixed,
						'1000px', null,
						true, {
							runtime: runtime,
							//taskTokens: this.userGameScoreService.taskTokens,
							//timeBonusTokens: this.userGameScoreService.timeBonusTokens,
							topicQuestionResultList: this.gameService.topicQuestionResultList,
							roundScore: this.gameService.getTotalTopicQuestionScore(),
							totalScore: this.userGameService.signalGameScore().score,
							wasLastGame: wasLastGame
						}, '', false, true,
						() => {
							this.exit(wasLastGame);
						}
					);*/
		}, 100);
	}
	
	protected exit(): void
	{
		this.signalIsShowingTaskSolvedDialog.set(false);
		this.soundService.playSound('modalFadeOut', true);
		
		UtilTimeout.setTimeout(() => {
			if (
				(!AppConfig.areMultiplierGames || this.userGameService.signalGameScore().score > 0) &&
				AppConfig.areMiniGamesEnabled &&
				(
					!this.gameService.signalGameConfig() || // is base game
					this.gameService.signalGameConfig()!.activeMiniGames.length > 0 // is special game
				)
			)
			{
				this.gameService.setNextMultiplierGame();
				this.initService.navigateToRoute(AppRoutesEnum.gameResult).then();
			}
			else
			{
				if (this.wasLastGame)
				{
					this.gameService.finishGameFully();
				}
				else
				{
					this.gameService.setQuizNumber(this.gameService.signalQuizNumber() + 1);
					this.initService.navigateToRoute(AppRoutesEnum.gameTopic).then();
				}
			}
		}, 500);
	}
}
