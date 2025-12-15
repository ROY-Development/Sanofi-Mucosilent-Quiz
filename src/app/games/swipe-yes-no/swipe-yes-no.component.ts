import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	inject,
	Input,
	OnDestroy,
	Output,
	signal,
	ViewChild
} from '@angular/core';
import {AppLoopService} from '../../core/services/app-loop.service';
import {GameStateEnum} from './enums/game-state.enum';
import {QuestionCardModel} from './models/question-card.model';
import {MathAngleUtil} from '../../shared/utils/math-angle.util';
import {GameService} from '../shape-slingshot/services/game.service';
import {GameService as GlobalGameService} from '../../core/services/game.service';
import {UtilTimeout} from '../../shared/utils/util-timeout';
import {SwipeYesNoService} from './services/swipe-yes-no.service';
import {FileLoadService} from '../../core/services/file-load.service';
import {SoundService} from '../../core/services/sound.service';
import {SoundNameEnum} from '../../shared/enums/sound-name.enum';
import {QuestionConfigModel} from './models/question-config.model';
import {AnswerConfigModel} from './models/answer-config.model';
import {BackgroundImageService} from '../../core/services/background-image.service';
import {Point2DInterface} from '../interfaces/point-2D.interface';
import {AppConfig} from '../../app.config';
import {AppIntervalService} from '../../core/services/app-interval.service';
import {BackgroundGradientService} from '../../core/services/background-gradient.service';
import {BackgroundAnimationService} from '../../core/services/background-animation.service';
import {ImageLoadService} from '../../core/services/image-load.service';
import {DialogCorrectComponent} from './dialogs/dialog-correct/dialog-correct.component';
import {ToastTypeEnum} from '../../shared/modules/toast/toast-type-enum';
import {ToastService} from '../../shared/modules/toast/toast.service';
import {InitService} from '../../core/services/init.service';
import {SelectedAnswerModel} from './models/selected-answer.model';
import {DialogIncorrectComponent} from './dialogs/dialog-incorrect/dialog-incorrect.component';
import {Subscription} from 'rxjs';

@Component({
	selector: 'app-swipe-yes-no',
	templateUrl: './swipe-yes-no.component.html',
	styleUrl: './swipe-yes-no.component.scss',
	changeDetection: ChangeDetectionStrategy.Default,
	standalone: false
})
export class SwipeYesNoComponent implements AfterViewInit, OnDestroy
{
	protected swipeYesNoService = inject(SwipeYesNoService);
	protected initService = inject(InitService);
	private fileLoadService = inject(FileLoadService);
	private soundService = inject(SoundService);
	private backgroundImageService = inject(BackgroundImageService);
	private backgroundGradientService = inject(BackgroundGradientService);
	private backgroundAnimationService = inject(BackgroundAnimationService);
	protected globalGameService = inject(GlobalGameService);
	private imageLoadService = inject(ImageLoadService);
	private toastService = inject(ToastService);
	private changeDetectorRef = inject(ChangeDetectorRef);
	
	@ViewChild('dialogCorrectComponent') public dialogCorrectComponent?: DialogCorrectComponent;
	@ViewChild('dialogIncorrectComponent') public dialogIncorrectComponent?: DialogIncorrectComponent;
	@ViewChild('game') public gameRef!: ElementRef<HTMLDivElement>;
	@ViewChild('board') public board!: ElementRef<HTMLDivElement>;
	@ViewChild('currentQuestionCard') public currentQuestionCardRef?: ElementRef<HTMLDivElement>;
	
	@ViewChild('btnLeft') public btnLeftRef?: ElementRef<HTMLButtonElement>;
	@ViewChild('btnRight') public btnRightRef?: ElementRef<HTMLButtonElement>;
	
	@Input({required: true}) public gameConfigUrl!: string;
	@Input({required: true}) public currentQuestionId!: number | null;
	@Input({required: true}) public correctComboCount!: number;
	@Input({required: true}) public maxQuizQuestionCount!: number;
	// @Input({required: true}) public playerName!: string;
	
	@Output() public readonly selectAnswerEvent = new EventEmitter<SelectedAnswerModel>();
	@Output() public readonly finishGame = new EventEmitter<{ isSuccess: boolean, runtime: number }>();
	
	public readonly signalAnswerTimerPosY = signal<number>(0);
	
	public readonly signalStarImageUrl = signal<string>('none');
	public readonly signalBtnCorrectImageUrl = signal<string | null>(null);
	public readonly signalBtnNotCorrectImageUrl = signal<string | null>(null);
	public readonly signalBtnQuestionImageUrl = signal<string | null>(null);
	public readonly signalGreatImageUrl = signal<string | null>(null);
	public readonly signalSwipeLeftRightImageUrl = signal<string | null>(null);
	
	public readonly signalLeftAnswerImageUrl = signal<string | null>(null);
	public readonly signalLeftAnswerKey = signal<string | null>(null);
	public readonly signalRightAnswerImageUrl = signal<string | null>(null);
	public readonly signalRightAnswerKey = signal<string | null>(null);
	
	public isDebug: boolean = false;
	
	protected gameState: GameStateEnum = GameStateEnum.init;
	
	protected currentQuestion: QuestionCardModel | null = null;
	
	private touchElement!: HTMLElement;
	private startX: number = 0;
	private startY: number = 0;
	private distX: number = 0;
	private distY: number = 0;
	private isTouchDown: boolean = false;
	
	private config: any = {};
	
	protected gameService: GameService = new GameService();
	
	protected readonly GameStateEnum = GameStateEnum;
	protected readonly MathAngleUtil = MathAngleUtil;
	protected readonly AppConfig = AppConfig;
	
	private readonly appLoopService: AppLoopService = new AppLoopService(this.loop.bind(this));
	private readonly appIntervalService: AppIntervalService = new AppIntervalService();
	
	private rerenderSubscription: Subscription | null = null;
	private showEditorChangesTimeoutSubscription: Subscription | null = null;
	
	constructor()
	{
		this.appLoopService.stop();
		this.appLoopService.setRuntime(0);
		this.appLoopService.init('SwipeYesNoComponent');
	}
	
	public ngAfterViewInit(): void
	{
		// triggered by the quiz game editor
		this.rerenderSubscription = this.swipeYesNoService.rerenderEmitter.subscribe((editorKey: string) => {
			this.changeDetectorRef.detectChanges();
			if (this.currentQuestion?.targetPos && this.currentQuestionCardRef)
			{
				this.signalAnswerTimerPosY.set(
					this.currentQuestionCardRef.nativeElement.offsetTop +
					this.currentQuestionCardRef.nativeElement.offsetHeight
				);
			}
			
			let image: HTMLImageElement | null = this.imageLoadService.getImage('swipeYesNoSwipeLeftRightImage');
			this.signalSwipeLeftRightImageUrl.set(image ? image.src : null);
			
			image = this.imageLoadService.getImage('swipeYesNoGreatImage');
			this.signalGreatImageUrl.set(image ? image.src : null);
			
			if (editorKey)
			{
				if (this.showEditorChangesTimeoutSubscription)
				{
					this.showEditorChangesTimeoutSubscription.unsubscribe();
					this.swipeYesNoService.signalIsEditorShowingCorrectScreen.set(false);
				}
				
				if (editorKey === 'correct')
				{
					this.swipeYesNoService.signalIsEditorShowingCorrectScreen.set(true);
					
					this.showEditorChangesTimeoutSubscription = UtilTimeout.setTimeout(() => {
						this.showEditorChangesTimeoutSubscription = null;
						this.swipeYesNoService.signalIsEditorShowingCorrectScreen.set(false);
					}, 2000);
				}
			}
		});
		
		this.init();
	}
	
	public ngOnDestroy(): void
	{
		if (this.rerenderSubscription)
		{
			this.rerenderSubscription.unsubscribe();
			this.rerenderSubscription = null;
		}
		
		if (this.showEditorChangesTimeoutSubscription)
		{
			this.showEditorChangesTimeoutSubscription.unsubscribe();
			this.showEditorChangesTimeoutSubscription = null;
		}
		
		this.appLoopService.stop();
		this.removeEventListeners();
	}
	
	public init(): void
	{
		this.touchElement = this.board.nativeElement;
		
		this.initGame().then();
	}
	
	public async initGame()
	{
		let blobsJson: any = [];
		
		try
		{
			blobsJson = await this.fileLoadService.loadFiles([
				this.gameConfigUrl
			]);
		}
		catch (err: any)
		{
			this.toastService.showToast(err, ToastTypeEnum.error, 30000);
		}
		
		if (blobsJson[0] && blobsJson[0].type.indexOf('application/json') !== -1)
		{
			const jsonText = await blobsJson[0].text();
			this.config = JSON.parse(jsonText);
		}
		
		let image: HTMLImageElement | null;
		
		image = this.imageLoadService.getImage('starImage');
		if (image)
		{
			this.signalStarImageUrl.set(`url('${image.src}')`);
		}
		
		image = this.imageLoadService.getImage('swipeYesNoBtnCorrectImage');
		if (image)
		{
			this.signalBtnCorrectImageUrl.set(image.src);
		}
		
		image = this.imageLoadService.getImage('swipeYesNoBtnNotCorrectImage');
		if (image)
		{
			this.signalBtnNotCorrectImageUrl.set(image.src);
		}
		
		image = this.imageLoadService.getImage('swipeYesNoBtnQuestionImage');
		if (image)
		{
			this.signalBtnQuestionImageUrl.set(image.src);
		}
		
		image = this.imageLoadService.getImage('swipeYesNoGreatImage');
		if (image)
		{
			this.signalGreatImageUrl.set(image.src);
		}
		
		image = this.imageLoadService.getImage('swipeYesNoSwipeLeftRightImage');
		if (image)
		{
			this.signalSwipeLeftRightImageUrl.set(image.src);
		}
		
		//console.log(this.config)
		this.swipeYesNoService.init(this.config, this.maxQuizQuestionCount);
		
		this.addEventListeners();
		
		//this.startGame();
		this.gameState = GameStateEnum.init;
		this.initQuestionCard();
	}
	
	/* prepare events - important for removing all event listeners */
	private mouseDown = this.onMouseDown.bind(this);
	private mouseUp = this.onMouseUp.bind(this);
	private mouseMove = this.onMouseMove.bind(this);
	
	private touchElementTouchStart = this.onTouchElementTouchStart.bind(this);
	private touchStart = this.onTouchStart.bind(this);
	private touchMove = this.onTouchMove.bind(this);
	private touchEnd = this.onTouchEnd.bind(this);
	private touchCancel = this.onTouchCancel.bind(this);
	
	private addEventListeners(): void
	{
		// mouse events
		this.touchElement.addEventListener('mousedown', this.mouseDown);
		window.addEventListener('mouseup', this.mouseUp);
		window.addEventListener('mousemove', this.mouseMove);
		
		// touch events
		this.touchElement.addEventListener('touchstart', this.touchElementTouchStart, {passive: false});
		this.touchElement.addEventListener('touchstart', this.touchStart);
		this.touchElement.addEventListener('touchmove', this.touchMove);
		this.touchElement.addEventListener('touchend', this.touchEnd);
		this.touchElement.addEventListener('touchcancel', this.touchCancel);
	}
	
	private removeEventListeners(): void
	{
		// mouse events
		this.touchElement?.removeEventListener('mousedown', this.mouseDown);
		window.removeEventListener('mouseup', this.mouseUp);
		window.removeEventListener('mousemove', this.mouseMove);
		
		// touch events
		this.touchElement?.removeEventListener('touchstart', this.touchElementTouchStart);
		this.touchElement?.removeEventListener('touchstart', this.touchStart);
		this.touchElement?.removeEventListener('touchmove', this.touchMove);
		this.touchElement?.removeEventListener('touchend', this.touchEnd);
		this.touchElement?.removeEventListener('touchcancel', this.touchCancel);
	}
	
	private onTouchElementTouchStart(event: TouchEvent): void
	{
		if (this.gameState !== GameStateEnum.running)
		{
			return;
		}
		
		event.preventDefault();
	}
	
	public startGame(): void
	{
		this.addQuestionCard();
		this.appLoopService.start();
	}
	
	private initQuestionCard(): void
	{
		//console.log('currentQuestionId', '#' + this.currentQuestionId + '#')
		//console.log('nextQuestionId', this.swipeYesNoService.getNextQuestionId(this.currentQuestionId));
		
		this.currentQuestionId = this.swipeYesNoService.getNextQuestionId(this.currentQuestionId);
		
		if (!this.currentQuestionId)
		{
			this.callFinishGame();
			return;
		}
		
		const questionConfig: QuestionConfigModel | null = this.swipeYesNoService.getQuestion(this.currentQuestionId);
		
		if (!questionConfig)
		{
			this.callFinishGame();
			return;
		}
		
		// set left answer image
		if (questionConfig.answerConfigs.length >= 1)
		{
			this.signalLeftAnswerKey.set(questionConfig.answerConfigs[0].answerKey);
			if (questionConfig.answerConfigs[0].imageUrl)
			{
				this.signalLeftAnswerImageUrl.set(questionConfig.answerConfigs[0].imageUrl);
			}
		}
		else if (this.swipeYesNoService.answerList.length >= 1)
		{
			this.signalLeftAnswerKey.set(this.swipeYesNoService.answerList[0].answerKey);
			if (this.swipeYesNoService.answerList[0].imageUrl)
			{
				this.signalLeftAnswerImageUrl.set(this.swipeYesNoService.answerList[0].imageUrl);
			}
		}
		else
		{
			this.signalLeftAnswerKey.set(null);
			this.signalLeftAnswerImageUrl.set(null);
		}
		// set right answer image
		if (questionConfig.answerConfigs.length >= 2)
		{
			this.signalRightAnswerKey.set(questionConfig.answerConfigs[1].answerKey);
			if (questionConfig.answerConfigs[1].imageUrl)
			{
				this.signalRightAnswerImageUrl.set(questionConfig.answerConfigs[1].imageUrl);
			}
		}
		else if (this.swipeYesNoService.answerList.length >= 2)
		{
			this.signalRightAnswerKey.set(this.swipeYesNoService.answerList[1].answerKey);
			if (this.swipeYesNoService.answerList[1].imageUrl)
			{
				this.signalRightAnswerImageUrl.set(this.swipeYesNoService.answerList[1].imageUrl);
			}
		}
		else
		{
			this.signalRightAnswerKey.set(null);
			this.signalRightAnswerImageUrl.set(null);
		}
		
		// if there is a question then increment question index
		this.globalGameService.currentQuestionIndex++;
		if (AppConfig.isDebugConsole)
		{
			console.log('currentQuestionIndex', this.globalGameService.currentQuestionIndex)
		}
		
		this.swipeYesNoService.updateCurrentQuestionNumber(questionConfig.id);
		this.swipeYesNoService.updateQuestionConfigValues(questionConfig, questionConfig.id);
		
		if (questionConfig.backgroundImageUrl) // per question
		{
			this.backgroundImageService.setBackgroundImageUrl(questionConfig.backgroundImageUrl);
		}
		else if (this.swipeYesNoService.backgroundImageUrl) // per topic
		{
			this.backgroundImageService.setBackgroundImageUrl(this.swipeYesNoService.backgroundImageUrl);
		}
		else
		{
			this.backgroundImageService.setBackgroundImageUrl(null);
		}
		
		if (questionConfig.backgroundColorsDuration)
		{
			this.backgroundGradientService.signalBackgroundColorsDuration.set(questionConfig.backgroundColorsDuration);
		}
		else if (this.swipeYesNoService.backgroundColorsDuration)
		{
			this.backgroundGradientService.signalBackgroundColorsDuration.set(this.swipeYesNoService.backgroundColorsDuration);
		}
		
		if (questionConfig.backgroundColors) // per question
		{
			this.backgroundGradientService.setBackgroundColors(questionConfig.backgroundColors);
		}
		else if (this.swipeYesNoService.backgroundColors) // per topic
		{
			this.backgroundGradientService.setBackgroundColors(this.swipeYesNoService.backgroundColors);
		}
		else
		{
			this.backgroundGradientService.update();
		}
		
		if (questionConfig.backgroundAnimationImageUrls) // per question
		{
			this.backgroundAnimationService.setImageUrls(
				questionConfig.backgroundAnimationImageUrls,
				questionConfig.backgroundAnimationType
			);
		}
		else if (this.swipeYesNoService.backgroundAnimationImageUrls) // per category/topic
		{
			this.backgroundAnimationService.setImageUrls(
				this.swipeYesNoService.backgroundAnimationImageUrls,
				this.swipeYesNoService.backgroundAnimationType
			);
		}
		else
		{
			this.backgroundAnimationService.init();
		}
	}
	
	private addQuestionCard(): void
	{
		if (!this.currentQuestionId)
		{
			this.callFinishGame();
			return;
		}
		
		const questionConfig: QuestionConfigModel | null = this.swipeYesNoService.getQuestion(this.currentQuestionId);
		
		if (!questionConfig)
		{
			this.callFinishGame();
			return;
		}
		
		this.gameState = GameStateEnum.addCard;
		this.soundService.playSound(SoundNameEnum.cardFadeIn, true);
		
		// card from top
		/*this.currentQuestion = new QuestionCardModel(
			this.gameService,
			question.id,
			question.isCorrect,
			130, -600,
			820, 600
		);
		this.currentQuestion.category = question.category;
		this.currentQuestion.textKey = 'question-' + question.id;
		
		UtilTimeout.setTimeout(() => {
			this.currentQuestion!.targetPos = {
				x: this.currentQuestion!.x + this.currentQuestion!.width * 0.5,
				y: 590 + this.currentQuestion!.height * 0.5
			};
			
			if (this.currentQuestionCardRef)
			{
				this.signalAnswerTimerPosY.set(y + this.currentQuestionCardRef.nativeElement.clientHeight);
			}
		}, 300);*/
		// top position of card
		const y: number = 360;
		
		this.currentQuestion = new QuestionCardModel(
			this.gameService,
			130, y,
			820, 600,
			questionConfig
		);
		this.currentQuestion.textKey = 'quiz-' +
			(this.swipeYesNoService.categoryKey ? this.swipeYesNoService.categoryKey + '-question-' : '') +
			questionConfig.id;
		
		this.currentQuestion.textFeedbackKey = 'quiz-' +
			(this.swipeYesNoService.categoryKey ? this.swipeYesNoService.categoryKey + '-feedback-' : '') +
			questionConfig.id;
		
		UtilTimeout.setTimeout(() => {
			this.currentQuestion!.targetPos = {
				x: this.currentQuestion!.x + this.currentQuestion!.width * 0.5,
				y: y + this.currentQuestion!.height * 0.5
			};
			
			this.currentQuestion!.scale = 1;
			
			if (this.currentQuestionCardRef)
			{
				//this.signalAnswerTimerPosY.set(y + this.currentQuestionCardRef.nativeElement.clientHeight);
				this.signalAnswerTimerPosY.set(
					this.currentQuestionCardRef.nativeElement.offsetTop +
					this.currentQuestionCardRef.nativeElement.offsetHeight
				);
			}
		}, 300);
	}
	
	private removeQuestionCard(): void
	{
		this.gameState = GameStateEnum.removeCard;
		this.soundService.playSound(SoundNameEnum.cardFadeOut, true);
		
		if (this.currentQuestion)
		{
			this.currentQuestion.targetPos = {
				x: this.currentQuestion!.x + this.currentQuestion!.width * 0.5,
				y: 1920 + this.currentQuestion!.height * 0.5
			};
		}
	}
	
	private onMouseDown(event: MouseEvent): void
	{
		event.stopImmediatePropagation();
		
		// console.log(event)
		this.resetTouch();
		
		if (this.gameState !== GameStateEnum.running)
		{
			return;
		}
		
		event.preventDefault();
		
		this.isTouchDown = true;
		this.startX = event.clientX; // X/Y-Koordinaten relativ zum Viewport
		this.startY = event.clientY;
	}
	
	private onMouseMove(event: MouseEvent): void
	{
		event.stopImmediatePropagation();
		event.preventDefault();
		
		if (!this.isTouchDown)
		{
			return;
		}
		
		if (this.gameState !== GameStateEnum.running)
		{
			this.resetTouch();
			return;
		}
		
		this.distX = event.clientX - this.startX;
		this.distY = event.clientY - this.startY;
		// console.log('touchmove horizontal: ' + this.distX + 'px vertikal: ' + this.distY + 'px');
		
		if (this.currentQuestion)
		{
			this.currentQuestion.swipeAngleX = this.distX / 360;
			this.currentQuestion.swipeAngleX = Math.max(this.currentQuestion.swipeAngleX, -Math.PI * 0.35);
			this.currentQuestion.swipeAngleX = Math.min(this.currentQuestion.swipeAngleX, Math.PI * 0.35);
		}
	}
	
	private onMouseUp(event: MouseEvent): void
	{
		event.stopImmediatePropagation();
		event.preventDefault();
		
		if (!this.isTouchDown)
		{
			return;
		}
		
		this.isTouchDown = false;
		
		if (this.gameState !== GameStateEnum.running)
		{
			this.resetTouch();
			return;
		}
		
		this.distX = event.clientX - this.startX;
		this.distY = event.clientY - this.startY;
		
		// console.log('touchend bei X-Koordinate: ' + touchObj.clientX + 'px Y-Koordinate: ' + touchObj.clientY + 'px');
		//console.log('touchend horizontal: ' + this.distX + 'px vertikal: ' + this.distY + 'px');
		
		/*if (this.currentQuestion)
		{
			this.currentQuestion.swipeAngleX = this.distX;
		}*/
		
		if (Math.abs(this.distX) < 30)
		{
			this.resetTouch();
			return;
		}
		
		const isSelectedLeft: boolean = this.distX < 0; // needs to be before reset
		this.resetTouch();
		
		//console.log('isSelectedLeft', isSelectedLeft, this.distX)
		
		this.selectAnswer(isSelectedLeft);
	}
	
	private onTouchStart(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		
		this.resetTouch();
		
		if (event.touches.length <= 0)
		{
			return;
		}
		
		if (this.gameState !== GameStateEnum.running)
		{
			return;
		}
		
		event.preventDefault();
		
		this.isTouchDown = true;
		
		//console.log(event)
		
		const touchObj: Touch = event.changedTouches[0]; // erster Finger
		this.startX = touchObj.clientX; // X/Y-Koordinaten relativ zum Viewport
		this.startY = touchObj.clientY;
		//console.log('touchstart bei ClientX: ' + this.startX + 'px ClientY: ' + this.startY + "px");
	}
	
	private onTouchMove(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		event.preventDefault();
		
		if (!this.isTouchDown)
		{
			return;
		}
		
		if (event.changedTouches.length <= 0)
		{
			return;
		}
		
		if (this.gameState !== GameStateEnum.running)
		{
			this.resetTouch();
			return;
		}
		
		const touchObj: Touch = event.changedTouches[0]; // erster Finger
		this.distX = touchObj.clientX - this.startX;
		this.distY = touchObj.clientY - this.startY;
		// console.log('touchmove horizontal: ' + this.distX + 'px vertikal: ' + this.distY + 'px');
		
		if (this.currentQuestion)
		{
			this.currentQuestion.swipeAngleX = this.distX / 360;
			this.currentQuestion.swipeAngleX = Math.max(this.currentQuestion.swipeAngleX, -Math.PI * 0.35);
			this.currentQuestion.swipeAngleX = Math.min(this.currentQuestion.swipeAngleX, Math.PI * 0.35);
		}
	}
	
	private onTouchEnd(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		event.preventDefault();
		
		if (!this.isTouchDown)
		{
			return;
		}
		
		this.isTouchDown = false;
		
		if (event.changedTouches.length <= 0)
		{
			return;
		}
		
		if (this.gameState !== GameStateEnum.running)
		{
			this.resetTouch();
			return;
		}
		
		const touchObj: Touch = event.changedTouches[0]; // reference first touch point for this event
		this.distX = touchObj.clientX - this.startX;
		this.distY = touchObj.clientY - this.startY;
		// console.log('touchend bei X-Koordinate: ' + touchObj.clientX + 'px Y-Koordinate: ' + touchObj.clientY + 'px');
		//console.log('touchend horizontal: ' + this.distX + 'px vertikal: ' + this.distY + 'px');
		
		/*if (this.currentQuestion)
		{
			this.currentQuestion.swipeAngleX = this.distX;
		}*/
		
		if (Math.abs(this.distX) < 30)
		{
			this.resetTouch();
			return;
		}
		
		const isSelectedLeft: boolean = this.distX < 0; // needs to be before reset
		this.resetTouch();
		
		//console.log('isSelectedLeft', isSelectedLeft, this.distX)
		
		this.selectAnswer(isSelectedLeft);
	}
	
	private onTouchCancel(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		
		this.resetTouch();
	}
	
	protected onClickSelectAnswer(selectedLeft: boolean): void
	{
		if (this.gameState === GameStateEnum.running)
		{
			this.soundService.playSound(SoundNameEnum.click, true);
			this.selectAnswer(selectedLeft);
		}
	}
	
	protected onClickShowAnswerDialog(): void
	{
		if (this.gameState === GameStateEnum.showAnswer)
		{
			return;
		}
		
		this.soundService.playSound(SoundNameEnum.click, true);
		this.soundService.playSound(SoundNameEnum.modalFadeIn, true);
		this.gameState = GameStateEnum.showAnswer;
		this.appIntervalService.reset();
	}
	
	protected onClickIncorrectDialogOk(): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		this.soundService.playSound(SoundNameEnum.modalFadeOut, true);
		this.initQuestionCard();
		this.addQuestionCard();
	}
	
	protected onAnimationDialogEnd(event: AnimationEvent)
	{
		if (
			event.animationName === 'dialogContainerFadeIn' &&
			this.gameState === GameStateEnum.incorrect
		)
		{
			this.dialogIncorrectComponent?.shake();
		}
	}
	
	private selectAnswer(isSelectedLeft: boolean): void
	{
		if (!this.currentQuestion)
		{
			console.error('There is no current question.');
			return;
		}
		
		this.gameState = GameStateEnum.removeCard;
		this.swipeYesNoService.stopTimer();
		
		let isSelectedCorrect: boolean;
		
		if (this.currentQuestion.questionConfig.answerConfigs.length >= 2)
		{
			const index: number = isSelectedLeft ? 0 : 1;
			const answerConfig: AnswerConfigModel = this.currentQuestion.questionConfig.answerConfigs[index];
			isSelectedCorrect = answerConfig.isCorrect;
		}
		else
		{
			isSelectedCorrect = isSelectedLeft === this.currentQuestion.questionConfig.leftCorrect;
		}
		
		this.swipeYesNoService.signalAnswerSelectedCorrect.set(isSelectedCorrect);
		
		this.swipeYesNoService.signalHasSwiped.set(true);
		
		this.soundService.playSound(SoundNameEnum.cardFadeOut, true);
		
		const addPushOutX: number = 30;
		this.currentQuestion.targetPos = {
			x: isSelectedLeft ? -this.currentQuestion.halfWidth - addPushOutX :
				this.board.nativeElement.clientWidth + this.currentQuestion.halfWidth + addPushOutX,
			y: this.currentQuestion.y + this.currentQuestion.halfHeight
		};
		
		if (isSelectedCorrect)
		{ // show correct animation
			this.gameState = GameStateEnum.correct;
			this.soundService.playSound(SoundNameEnum.answerRight, true);
			
			// if the question is set to automatic answer, then show it
			if (this.currentQuestion.questionConfig.hasAutomaticAnswer)
			{
				this.appIntervalService.startIntervalFunction(1500, 0, () => {
					//
				}, () => {
					this.soundService.playSound(SoundNameEnum.modalFadeIn, true);
					this.gameState = GameStateEnum.showAnswer;
					this.appIntervalService.reset();
				});
			}
			else
			{
				this.appIntervalService.startIntervalFunction(1500, 0, () => {
					//
				}, () => {
					this.initQuestionCard();
					this.addQuestionCard();
				});
			}
		}
		
		let btnPosition: Point2DInterface = {x: 0, y: 0};
		
		if (this.btnLeftRef && isSelectedLeft)
		{
			btnPosition = this.getPositionOnScreen(this.btnLeftRef.nativeElement, 'center');
		}
		else if (this.btnRightRef)
		{
			btnPosition = this.getPositionOnScreen(this.btnRightRef.nativeElement, 'center');
		}
		
		this.changeDetectorRef.detectChanges();
		
		let comboPosition: Point2DInterface | null = null;
		let superfastPosition: Point2DInterface | null = null;
		
		if (isSelectedCorrect)
		{
			if (this.dialogCorrectComponent)
			{
				if (this.dialogCorrectComponent.comboContainerRef)
				{
					comboPosition = this.getPositionOnScreen(this.dialogCorrectComponent.comboContainerRef.nativeElement, 'right');
				}
				if (this.dialogCorrectComponent.superfastContainerRef)
				{
					superfastPosition = this.getPositionOnScreen(this.dialogCorrectComponent.superfastContainerRef.nativeElement, 'right');
				}
			}
		}
		
		const categoryLocalisationKey: string = 'quiz-' + (this.swipeYesNoService.categoryKey ?? '');
		const answerLeftLocalisationKey: string = this.getAnswerKey(true);
		const answerRightLocalisationKey: string = this.getAnswerKey(false);
		
		const selectAnswer: SelectedAnswerModel = new SelectedAnswerModel(
			this.currentQuestion.questionConfig.id,
			this.currentQuestion.questionConfig.leftCorrect,
			isSelectedLeft,
			isSelectedCorrect,
			this.swipeYesNoService.signalAnswerTimerFactor(),
			this.swipeYesNoService.signalRemainingTimeRank(),
			btnPosition,
			comboPosition,
			superfastPosition,
			categoryLocalisationKey,
			this.currentQuestion.textKey ?? '',
			this.currentQuestion.textFeedbackKey ?? '',
			answerLeftLocalisationKey,
			answerRightLocalisationKey
		);
		
		this.selectAnswerEvent.emit(selectAnswer);
	}
	
	private getAnswerKey(isLeft: boolean): string
	{
		const index: number = isLeft ? 0 : 1;
		
		let answerKey1: string = index === 0 ? 'not-correct' : 'correct';
		
		if (this.currentQuestion && this.currentQuestion.questionConfig.answerConfigs.length >= index + 1)
		{
			answerKey1 = this.currentQuestion.questionConfig.answerConfigs[index].answerKey || '';
		}
		else if (this.swipeYesNoService.answerList.length >= index + 1)
		{
			answerKey1 = this.swipeYesNoService.answerList[index].answerKey;
		}
		
		return answerKey1;
	}
	
	private getPositionOnScreen(element: HTMLElement, horizontalType: 'left' | 'center' | 'right'): Point2DInterface
	{
		const boardRect = this.board.nativeElement.getBoundingClientRect();
		const elementRect = element.getBoundingClientRect();
		const scale = boardRect.width / this.board.nativeElement.clientWidth;
		const offsetX: number = horizontalType === 'left' ? 0 : horizontalType === 'right' ? elementRect.width : elementRect.width * 0.5;
		
		return {
			x: (elementRect.left + offsetX - boardRect.left) / scale,
			y: (elementRect.top + elementRect.height * 0.5) / scale
		};
	}
	
	private resetTouch(): void
	{
		this.startX = 0;
		this.startY = 0;
		this.distX = 0;
		this.distY = 0;
		this.isTouchDown = false;
		
		if (this.currentQuestion)
		{
			this.currentQuestion.swipeAngleX = 0;
		}
	}
	
	private update(delta: number)
	{
		// const deltaFactor: number = delta * 0.06;
		
		/*for (const card of this.cards)
		{
			card.update(delta, deltaFactor);
		}*/
		
		this.appIntervalService.update(delta);
		this.swipeYesNoService.update(delta);
		
		if (this.currentQuestion)
		{
			this.currentQuestion.update(delta);
			
			if (this.gameState === GameStateEnum.addCard)
			{
				if (this.currentQuestion.isAtTargetPosition)
				{
					this.gameState = GameStateEnum.running;
					this.swipeYesNoService.startTimer();
				}
			}
			else if (this.gameState === GameStateEnum.running)
			{
				if (this.swipeYesNoService.signalAnswerTimerMSec() <= 0)
				{
					this.swipeYesNoService.signalAnswerSelectedCorrect.set(null);
					this.swipeYesNoService.stopTimer();
					
					const categoryLocalisationKey: string = 'quiz-' + (this.swipeYesNoService.categoryKey ?? '');
					const answerLeftLocalisationKey: string = this.getAnswerKey(true);
					const answerRightLocalisationKey: string = this.getAnswerKey(false);
					
					const selectAnswer: SelectedAnswerModel = new SelectedAnswerModel(
						this.currentQuestion.questionConfig.id,
						this.currentQuestion.questionConfig.leftCorrect,
						null,
						false,
						this.swipeYesNoService.signalAnswerTimerFactor(),
						this.swipeYesNoService.signalRemainingTimeRank(),
						{x: 0, y: 0},
						null,
						null,
						categoryLocalisationKey,
						this.currentQuestion.textKey ?? '',
						this.currentQuestion.textFeedbackKey ?? '',
						answerLeftLocalisationKey,
						answerRightLocalisationKey
					);
					
					this.selectAnswerEvent.emit(selectAnswer);
					this.removeQuestionCard();
				}
			}
			else if (this.gameState === GameStateEnum.removeCard)
			{
				if (this.currentQuestion.isAtTargetPosition)
				{
					/*console.log(
						'currentQuestion.isCorrect', this.currentQuestion.isCorrect,
						'answerSelectedState', this.swipeYesNoService.signalAnswerSelectedState()
					);*/
					
					/*if (this.swipeYesNoService.signalAnswerSelectedCorrect() === true)
					{ // show correct animation
						this.gameState = GameStateEnum.correct;
						this.soundService.playSound(SoundNameEnum.answerRight, true);
						
						UtilTimeout.setTimeout(() => {
							this.initQuestionCard();
							this.addQuestionCard();
						}, 750);
					}
					else*/
					
					if (
						this.swipeYesNoService.signalAnswerSelectedCorrect() === false ||
						this.swipeYesNoService.signalAnswerSelectedCorrect() === null
					) // show dialog
					{
						this.gameState = GameStateEnum.incorrect;
						this.soundService.playSound(SoundNameEnum.answerWrong, true);
						this.soundService.playSound(SoundNameEnum.modalFadeIn, true);
					}
				}
			}
		}
		
		this.changeDetectorRef.detectChanges();
	}
	
	private callFinishGame(): void
	{
		this.gameState = GameStateEnum.finish;
		
		this.appLoopService.stop();
		this.removeEventListeners();
		
		const runtime: number = Math.floor(this.appLoopService.signalRuntime() / 1000);
		// console.log('finish game - runtime: ', runtime);
		this.finishGame.emit({isSuccess: true, runtime: runtime});
	}
	
	private loop(delta: number): void
	{
		this.update(delta);
		this.changeDetectorRef.detectChanges();
	}
}
