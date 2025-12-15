import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	HostListener,
	inject,
	OnDestroy,
	OnInit,
	signal,
	ViewChild
} from '@angular/core';
import {GameService} from '../../core/services/game.service';
import {InitService} from '../../core/services/init.service';
import {AppRoutesEnum} from '../../app-routes.enum';
import {TopicModel} from '../../shared/models/topic.model';
import {UtilTimeout} from '../../shared/utils/util-timeout';
import {SoundService} from '../../core/services/sound.service';
import {SoundNameEnum} from '../../shared/enums/sound-name.enum';
import {Subscription} from 'rxjs';
import {FileLoadService} from '../../core/services/file-load.service';
import {ToastService} from '../../shared/modules/toast/toast.service';
import {ToastTypeEnum} from '../../shared/modules/toast/toast-type-enum';
import {AppLoopService} from '../../core/services/app-loop.service';
import {AppIntervalService} from '../../core/services/app-interval.service';
import {Point2DInterface} from '../../games/interfaces/point-2D.interface';
import {NativeTranslateService} from '../../core/services/native-translate.service';
import {GameCoinsService} from '../../core/services/game-coins.service';
import {GameHeaderService} from '../../core/services/game-header.service';
import {UserGameService} from '../../core/services/user-game.service';
import {ImageLoadService} from '../../core/services/image-load.service';
import {UtilObj} from '../../shared/utils/util-obj';
import {SplitScreenAnimationTypeEnum} from '../../shared/enums/split-screen-animation-type.enum';
import {AppConfig} from '../../app.config';

@Component({
	selector: 'app-game-topic-page',
	templateUrl: './game-topic-page.component.html',
	styleUrl: './game-topic-page.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: false
})
export class GameTopicPageComponent implements OnInit, OnDestroy
{
	protected initService = inject(InitService);
	protected gameService = inject(GameService);
	private userGameService = inject(UserGameService);
	private gameCoinsService = inject(GameCoinsService);
	private gameHeaderService = inject(GameHeaderService);
	protected nativeTranslateService = inject(NativeTranslateService);
	private fileLoadService = inject(FileLoadService);
	private imageLoadService = inject(ImageLoadService);
	private soundService = inject(SoundService);
	private toastService = inject(ToastService);
	private changeDetectorRef = inject(ChangeDetectorRef);
	private readonly appLoopService: AppLoopService = new AppLoopService(this.loop.bind(this));
	private readonly appIntervalService: AppIntervalService = new AppIntervalService();
	
	@ViewChild('board') public board!: ElementRef<HTMLDivElement>;
	@ViewChild('scoreGift') protected readonly scoreGiftRef?: ElementRef<HTMLDivElement>;
	@ViewChild('categoryCard1') protected readonly categoryCard1?: ElementRef<HTMLDivElement>;
	@ViewChild('categoryCard2') protected readonly categoryCard2?: ElementRef<HTMLDivElement>;
	
	protected areTestButtonsEnabled: boolean = false;
	
	protected readonly signalMaxQuizRoundCount = signal<number>(0);
	
	protected readonly signalTopic1 = signal<TopicModel | null>(null);
	protected readonly signalTopic2 = signal<TopicModel | null>(null);
	protected readonly signalOldTopic1 = signal<TopicModel | null>(null);
	protected readonly signalOldTopic2 = signal<TopicModel | null>(null);
	protected readonly signalOldLeftSide = signal<boolean>(false);
	
	protected readonly signalIsChooseTextEnabled = signal<boolean>(false);
	protected readonly signalIsStartPointEnabled = signal<boolean>(false);
	protected readonly signalState = signal<number>(0);
	
	protected readonly pathColor: string = '#6c6cff';
	
	// Y at selection buttons
	protected readonly signaLineStartBottomVisible = signal<boolean>(false);
	protected readonly signaLineStartLeftVisible = signal<boolean>(false);
	protected readonly signaLineStartLeftCentered = signal<boolean>(false);
	protected readonly signaLineStartRightVisible = signal<boolean>(false);
	
	// Y at old selection buttons
	protected readonly signaLineStartBottom2Visible = signal<boolean>(false);
	protected readonly signaLineStartLeft2Visible = signal<boolean>(false);
	protected readonly signaLineStartLeft2Centered = signal<boolean>(false);
	protected readonly signaLineStartRight2Visible = signal<boolean>(false);
	
	// line before
	protected readonly signaIsLineBeforeVisible = signal<boolean>(false);
	protected readonly signaIsLineBeforeRight = signal<boolean>(false);
	protected readonly signaIsLineBeforeCentered = signal<boolean>(false);
	
	// line before2
	protected readonly signaIsLineBefore2Visible = signal<boolean>(false);
	protected readonly signaIsLineBefore2Right = signal<boolean>(false);
	protected readonly signaIsLineBefore2Centered = signal<boolean>(false);
	
	protected readonly signalCategoryLeftVisible = signal<boolean>(false);
	protected readonly signalCategoryRightVisible = signal<boolean>(false);
	
	protected readonly signalScrollPageX = signal<number>(0);
	protected readonly signalScrollPageY = signal<number>(0);
	protected readonly signalPageZoom = signal<number>(1);
	protected readonly signalPageOpacity = signal<number>(1);
	
	protected readonly signalPathGiftScore = signal<number>(0);
	
	protected scrollPageTargetX: number = 0;
	protected scrollPageTargetY: number = 0;
	protected scrollPageTargetZoom: number = 1;
	
	protected readonly signalOffsetOldCategoriesX = signal<number>(0);
	protected readonly signalOffsetOldCategoriesY = signal<number>(0);
	
	protected readonly signalBtnGiftClosedImageUrl = signal<string>('none');
	protected readonly signalBtnGiftOpenImageUrl = signal<string>('none');
	protected readonly signalIsGiftOpen = signal<boolean>(false);
	
	private backgroundSoundTimeoutSubscription: Subscription | null = null;
	private pageAniTimeoutSubscription: Subscription | null = null;
	private topicAniTimeoutSubscription: Subscription | null = null;
	
	protected buttonXPlusDown: boolean = false;
	protected buttonXMinusDown: boolean = false;
	protected buttonYPlusDown: boolean = false;
	protected buttonYMinusDown: boolean = false;
	
	constructor()
	{
		this.appLoopService.stop();
		this.appLoopService.setRuntime(0);
		this.appLoopService.init('GameTopicPageComponent');
	}
	
	public ngOnInit()
	{
		this.gameService.setCurrentTopic(-1);
		
		if (this.gameService.currentTopics.length < 1)
		{
			this.gameService.refreshCurrentTopics();
			/*this.gameService.currentTopics = [
				new TopicModel(1, '', 'assets/json/config-test1.json'),
				new TopicModel(2, '', 'assets/json/config-test2.json')
			];*/
		}
		
		const maxQuizRoundCount: number = this.gameService.signalGameConfig() ?
			this.gameService.signalGameConfig()!.maxQuizRoundCount : AppConfig.maxQuizRoundCount;
		this.signalMaxQuizRoundCount.set(maxQuizRoundCount);
		
		this.signalTopic1.set(this.gameService.currentTopics.length > 0 ? this.gameService.currentTopics[0] : null);
		this.signalTopic2.set(this.gameService.currentTopics.length > 1 ? this.gameService.currentTopics[1] : null);
		
		const nr: string = '01'; //UtilString.addLeadingZeros(this.userGameService.signalQuizNumber(), 2);
		const songName: string = 'chooseTopicMusic' + nr;
		
		let image: HTMLImageElement | null;
		
		image = this.imageLoadService.getImage('giftClosedImage');
		if (this.signalBtnGiftClosedImageUrl() === 'none' && image)
		{
			this.signalBtnGiftClosedImageUrl.set(`url('${image.src}')`);
		}
		
		image = this.imageLoadService.getImage('giftOpenImage');
		if (this.signalBtnGiftOpenImageUrl() === 'none' && image)
		{
			this.signalBtnGiftOpenImageUrl.set(`url('${image.src}')`);
		}
		
		this.loadTopicConfigs().then();
		
		this.backgroundSoundTimeoutSubscription = UtilTimeout.setTimeout(() => {
			this.backgroundSoundTimeoutSubscription = null;
			
			this.soundService.stopAllBackgroundSounds();
			this.soundService.playBackgroundSound(songName);
		}, 500);
		
		this.startAnimation();
	}
	
	public ngOnDestroy(): void
	{
		this.appLoopService.stop();
		if (this.backgroundSoundTimeoutSubscription)
		{
			this.backgroundSoundTimeoutSubscription.unsubscribe();
			this.backgroundSoundTimeoutSubscription = null;
		}
		
		if (this.pageAniTimeoutSubscription)
		{
			this.pageAniTimeoutSubscription.unsubscribe();
			this.pageAniTimeoutSubscription = null;
		}
		
		if (this.topicAniTimeoutSubscription)
		{
			this.topicAniTimeoutSubscription.unsubscribe();
			this.topicAniTimeoutSubscription = null;
		}
	}
	
	@HostListener('window:resize', [])
	public onResize(): void
	{
		this.changeDetectorRef.detectChanges();
	}
	
	private resetAnimation(): void
	{
		// Y at selection buttons
		this.signaLineStartBottomVisible.set(false);
		this.signaLineStartLeftVisible.set(false);
		this.signaLineStartLeftCentered.set(false);
		this.signaLineStartRightVisible.set(false);
		this.signaLineStartBottom2Visible.set(false);
		this.signaLineStartLeft2Visible.set(false);
		this.signaLineStartLeft2Centered.set(false);
		this.signaLineStartRight2Visible.set(false);
		this.signaIsLineBeforeVisible.set(false);
		this.signaIsLineBeforeRight.set(false);
		this.signaIsLineBeforeCentered.set(false);
		
		this.signaIsLineBefore2Visible.set(false);
		this.signaIsLineBefore2Right.set(false);
		this.signaIsLineBefore2Centered.set(false);
		
		this.signalCategoryLeftVisible.set(false);
		this.signalCategoryRightVisible.set(false);
		
		this.signalScrollPageX.set(0);
		this.signalScrollPageY.set(0);
		
		this.signalPathGiftScore.set(0);
		
		this.scrollPageTargetX = 0;
		this.scrollPageTargetY = 0;
		
		this.signalOffsetOldCategoriesX.set(0);
		this.signalOffsetOldCategoriesY.set(0);
	}
	
	private startAnimation(): void
	{
		this.resetAnimation();
		this.appLoopService.start();
		
		this.signalIsChooseTextEnabled.set(false);
		
		if (this.gameService.signalQuizNumber() === 1)
		{
			this.signalState.set(0);
		}
		else if (this.gameService.signalQuizNumber() === 2)
		{
			this.signalState.set(1);
		}
		else if (this.gameService.signalQuizNumber() >= 3)
		{
			this.signalState.set(2);
		}
		
		if (this.signalState() === 0)
		{
			this.startAnimationStart();
		}
		else if (this.signalState() >= 1)
		{
			this.startAnimationStartToMid();
		}
	}
	
	private startAnimationStart(): void
	{
		this.pageAniTimeoutSubscription = UtilTimeout.setTimeout(() => {
			// show start point
			this.signalIsStartPointEnabled.set(true);
			
			this.pageAniTimeoutSubscription = UtilTimeout.setTimeout(() => {
				// show left line
				this.appIntervalService.startIntervalFunction(5, 7, () => {
					this.signaLineStartBottomVisible.set(!this.signaLineStartBottomVisible());
					
					this.appIntervalService.intervalStartTime += 15;
					this.soundService.playSound(SoundNameEnum.categoryFlash, true);
				}, () => {
					this.signaLineStartBottomVisible.set(true);
					
					const topic2: TopicModel | null = this.signalTopic2();
					this.signaLineStartLeftCentered.set(!topic2);
					
					// show the right line
					this.pageAniTimeoutSubscription = UtilTimeout.setTimeout(() => {
						this.appIntervalService.startIntervalFunction(5, 7, () => {
							this.signaLineStartLeftVisible.set(!this.signaLineStartLeftVisible());
							if (topic2)
							{
								this.signaLineStartRightVisible.set(!this.signaLineStartRightVisible());
							}
							
							this.appIntervalService.intervalStartTime += 15;
							this.soundService.playSound(SoundNameEnum.categoryFlash, true);
						}, () => {
							this.signaLineStartLeftVisible.set(true);
							if (topic2)
							{
								this.signaLineStartRightVisible.set(true);
							}
							
							this.signalCategoryLeftVisible.set(true);
							this.signalCategoryRightVisible.set(true);
							
							this.pageAniTimeoutSubscription = UtilTimeout.setTimeout(() => {
								if (this.scrollPageTargetZoom === 1)
								{
									if (this.gameService.currentTopic !== this.signalTopic1() &&
										this.gameService.currentTopic !== this.signalTopic2())
									{
										this.signalIsChooseTextEnabled.set(true);
									}
								}
							}, 500);
						});
					}, 200);
				});
			}, 1000);
		}, 300);
	}
	
	private startAnimationStartToMid(): void
	{
		const lastHistory = this.gameService.oldTopicsHistory[this.gameService.oldTopicsHistory.length - 1];
		
		if (!lastHistory)
		{
			return;
		}
		
		let lastHistory2: { topics: Array<TopicModel>, isLeft: boolean } | null = null;
		if (this.gameService.oldTopicsHistory.length >= 2)
		{
			lastHistory2 = this.gameService.oldTopicsHistory[this.gameService.oldTopicsHistory.length - 2];
		}
		
		const wasLeft = lastHistory.isLeft;
		const oldTopics = lastHistory.topics;
		
		if (oldTopics.length > 0)
		{
			this.signalOldTopic1.set(oldTopics[0]);
		}
		if (oldTopics.length > 1)
		{
			this.signalOldTopic2.set(oldTopics[1]);
		}
		this.signalOldLeftSide.set(wasLeft);
		
		const topic2: TopicModel | null = this.signalTopic2();
		const oldTopic2: TopicModel | null = this.signalOldTopic2();
		
		const horizontalOffsetX: number = oldTopic2 ? 880 : 0; // 610;
		const horizontalOffsetY: number = 1260;
		
		this.signalScrollPageX.set(wasLeft ? -horizontalOffsetX : horizontalOffsetX);
		this.signalScrollPageY.set(-horizontalOffsetY);
		
		this.scrollPageTargetX = this.signalScrollPageX();
		this.scrollPageTargetY = this.signalScrollPageY();
		
		this.signalOffsetOldCategoriesX.set(-this.signalScrollPageX());
		this.signalOffsetOldCategoriesY.set(-this.signalScrollPageY());
		
		this.signaLineStartLeft2Visible.set(true);
		this.signaLineStartLeft2Centered.set(!oldTopic2);
		this.signaLineStartRight2Visible.set(!!oldTopic2);
		
		this.signaLineStartBottom2Visible.set(true);
		
		this.signaIsLineBeforeRight.set(!!oldTopic2 && !!lastHistory?.isLeft);
		
		this.signaIsLineBeforeCentered.set(!oldTopic2);
		
		if (this.signalState() === 1)
		{
			this.signalIsStartPointEnabled.set(true);
		}
		else if (this.signalState() === 2)
		{
			this.signalIsStartPointEnabled.set(false);
			
			this.signaIsLineBefore2Visible.set(true);
			if (lastHistory2)
			{
				this.signaIsLineBefore2Right.set(lastHistory2.isLeft);
				this.signaIsLineBefore2Centered.set(lastHistory2.topics.length < 2);
			}
		}
		
		this.pageAniTimeoutSubscription = UtilTimeout.setTimeout(() => {
			this.scrollPageTargetX = 0;
			this.scrollPageTargetY = 0;
			
			this.pageAniTimeoutSubscription = UtilTimeout.setTimeout(() => {
				this.appIntervalService.startIntervalFunction(5, 7, () => {
					this.signaIsLineBeforeVisible.set(!this.signaIsLineBeforeVisible());
					this.signaLineStartBottomVisible.set(!this.signaLineStartBottomVisible());
					
					this.appIntervalService.intervalStartTime += 15;
					this.soundService.playSound(SoundNameEnum.categoryFlash, true);
				}, () => {
					this.signaIsLineBeforeVisible.set(true);
					this.signaLineStartBottomVisible.set(true);
					
					this.signaLineStartLeftCentered.set(!topic2);
					
					// show the right line
					this.pageAniTimeoutSubscription = UtilTimeout.setTimeout(() => {
						this.appIntervalService.startIntervalFunction(5, 7, () => {
							this.signaLineStartLeftVisible.set(!this.signaLineStartLeftVisible());
							if (topic2)
							{
								this.signaLineStartRightVisible.set(!this.signaLineStartRightVisible());
							}
							
							this.appIntervalService.intervalStartTime += 15;
							this.soundService.playSound(SoundNameEnum.categoryFlash, true);
						}, () => {
							this.signaLineStartLeftVisible.set(true);
							if (topic2)
							{
								this.signaLineStartRightVisible.set(true);
							}
							
							this.signalCategoryLeftVisible.set(true);
							this.signalCategoryRightVisible.set(true);
							
							// add randomly an extra score
							const rnd: number = Math.floor(Math.random() * 6);
							
							if (rnd === 0)
							{
								const score: number = Math.floor(Math.random() * 5) * 100 + 400;
								// this.addGiftScore(score);
								this.showGiftPackage(score);
							}
							
							this.pageAniTimeoutSubscription = UtilTimeout.setTimeout(() => {
								this.signalIsChooseTextEnabled.set(true);
							}, 1100);
						});
					}, 200);
				});
			}, 800);
		}, 1200);
		
		this.changeDetectorRef.detectChanges();
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
	
	/*protected addGiftScore(score: number): void
	{
		this.signalPathGiftScore.set(score);
		this.changeDetectorRef.detectChanges();
		
		if (!this.scoreGiftRef)
		{
			return;
		}
		
		const position = this.getPositionOnScreen(this.scoreGiftRef.nativeElement, 'center');
		const targetX: number = 784;
		const targetY: number = 54;
		
		this.userGameService.addScore(score);
		this.gameHeaderService.prepareGameScore(this.userGameService.signalGameScore().score);
		
		this.soundService.playSound(SoundNameEnum.answerRight, true);
		
		this.gameCoinsService.start(position.x, position.y, targetX, targetY, 4, () => {
			// console.log('onShrink')
			this.gameHeaderService.updateGameScore();
		}, null);
	}*/
	
	protected showGiftPackage(score: number): void
	{
		this.signalPathGiftScore.set(score);
		this.changeDetectorRef.detectChanges();
	}
	
	protected onClickOpenGift(): void
	{
		if (this.signalIsGiftOpen() || this.signalPathGiftScore() <= 0)
		{
			return;
		}
		
		this.signalIsGiftOpen.set(true);
		
		if (!this.scoreGiftRef)
		{
			return;
		}
		
		const position = this.getPositionOnScreen(this.scoreGiftRef.nativeElement, 'center');
		const targetX: number = 784;
		const targetY: number = 54;
		
		this.userGameService.addScore(this.signalPathGiftScore());
		this.gameHeaderService.prepareGameScore(this.userGameService.signalGameScore().score);
		
		this.soundService.playSound(SoundNameEnum.answerRight, true);
		
		this.gameCoinsService.start(position.x, position.y, targetX, targetY, 4, () => {
			// console.log('onShrink')
			this.gameHeaderService.updateGameScore();
		}, null);
	}
	
	protected clickTest(): void
	{
		const rnd: number = Math.floor(Math.random() * 2);
		const topic: TopicModel | null = this.gameService.currentTopics[rnd];
		
		if (!topic)
		{
			return;
		}
		
		this.gameService.setCurrentTopic(topic.id);//, true);
		this.gameService.currentTopic = null;
		
		if (this.gameService.currentTopics.length < 1)
		{
			this.gameService.refreshCurrentTopics();
		}
		
		if (this.gameService.currentTopics.length > 0)
		{
			this.signalTopic1.set(this.gameService.currentTopics[0]);
		}
		if (this.gameService.currentTopics.length > 1)
		{
			this.signalTopic2.set(this.gameService.currentTopics[1]);
		}
		
		this.loadTopicConfigs().then();
		
		//	this.gameService.oldTopicsHistory.push(oldTopics);
		
		this.changeDetectorRef.detectChanges();
		console.log(this.gameService.oldTopicsHistory);
		
		this.gameService.signalQuizNumber.set(this.gameService.signalQuizNumber() + 1);
		
		this.startAnimation();
	}
	
	private async loadTopicConfigs(): Promise<void>
	{
		let fileUrls: Array<string> = [];
		const topic1Url = this.signalTopic1()?.url;
		const topic2Url = this.signalTopic2()?.url;
		
		if (topic1Url)
		{
			fileUrls.push(topic1Url);
		}
		if (topic2Url)
		{
			fileUrls.push(topic2Url);
		}
		
		let blobsJson: any = [];
		
		try
		{
			blobsJson = await this.fileLoadService.loadFiles(fileUrls);
		}
		catch (err: any)
		{
			this.toastService.showToast(err, ToastTypeEnum.error, 30000);
		}
		
		fileUrls = [];
		
		if (blobsJson[0] && blobsJson[0].type.indexOf('application/json') !== -1)
		{
			if (topic1Url)
			{
				const jsonText = await blobsJson[0].text();
				const config = JSON.parse(jsonText);
				
				if (config.categoryKey)
				{
					this.signalTopic1()!.name = config.categoryKey;
				}
				
				const hasOverridingValues: boolean = UtilObj.isset(config.hasOverridingValues) && config.hasOverridingValues === true;
				if (hasOverridingValues)
				{
					this.signalTopic1()!.categorySplitScreenConfig = {
						backgroundColor: config.splitScreenColorBg ?? '#d4d4d442',
						animationType: UtilObj.isset(config['splitScreenAnimationType']) ?
							(config['splitScreenAnimationType'] as SplitScreenAnimationTypeEnum) :
							SplitScreenAnimationTypeEnum.diagonalLeftToRight,
						backgroundImageUrl: config['imageSplitScreenBg'] ?? null
					}
				}
				else
				{
					this.signalTopic1()!.categorySplitScreenConfig = null;
				}
			}
		}
		if (blobsJson[1] && blobsJson[1].type.indexOf('application/json') !== -1)
		{
			if (topic2Url)
			{
				const jsonText = await blobsJson[1].text();
				const config = JSON.parse(jsonText);
				
				if (config.categoryKey)
				{
					this.signalTopic2()!.name = config.categoryKey;
				}
				
				const hasOverridingValues: boolean = UtilObj.isset(config.hasOverridingValues) && config.hasOverridingValues === true;
				if (hasOverridingValues)
				{
					this.signalTopic2()!.categorySplitScreenConfig = {
						backgroundColor: config.splitScreenColorBg ?? '#d4d4d442',
						animationType: UtilObj.isset(config['splitScreenAnimationType']) ?
							(config['splitScreenAnimationType'] as SplitScreenAnimationTypeEnum) :
							SplitScreenAnimationTypeEnum.diagonalLeftToRight,
						backgroundImageUrl: config['imageSplitScreenBg'] ?? null
					}
				}
				else
				{
					this.signalTopic2()!.categorySplitScreenConfig = null;
				}
			}
		}
		
		let url: string;
		if (this.signalTopic1()?.categorySplitScreenConfig?.backgroundImageUrl)
		{
			url = this.signalTopic1()!.basePath + '/images/' +
				this.signalTopic1()!.categorySplitScreenConfig!.backgroundImageUrl! + '.png';
			fileUrls.push(url)
		}
		if (this.signalTopic2()?.categorySplitScreenConfig?.backgroundImageUrl)
		{
			url = this.signalTopic2()!.basePath + '/images/' +
				this.signalTopic2()!.categorySplitScreenConfig!.backgroundImageUrl! + '.png';
			fileUrls.push(url)
		}
		
		try
		{
			blobsJson = await this.fileLoadService.loadFiles(fileUrls);
		}
		catch (err: any)
		{
			this.toastService.showToast(err, ToastTypeEnum.error, 30000);
		}
		
		if (blobsJson[0] && (blobsJson[0].type === 'image/jpeg' || blobsJson[0].type === 'image/png' || blobsJson[0].type === 'image/svg+xml'))
		{
			this.imageLoadService.addImage(this.signalTopic1()!.name + 'SplitScreenBgImage', blobsJson[0]);
		}
		if (blobsJson[1] && (blobsJson[1].type === 'image/jpeg' || blobsJson[1].type === 'image/png' || blobsJson[1].type === 'image/svg+xml'))
		{
			this.imageLoadService.addImage(this.signalTopic2()!.name + 'SplitScreenBgImage', blobsJson[1]);
		}
		
		this.changeDetectorRef.detectChanges();
	}
	
	protected setScrollPageZoom(horizontalType: 'left' | 'center' | 'right'): void
	{
		if (this.scrollPageTargetZoom === 1)
		{
			this.scrollPageTargetZoom = 2.5;
			
			const moveX: number = this.categoryCard1!.nativeElement.clientWidth * 0.5 * this.scrollPageTargetZoom; // OK
			
			if (horizontalType === 'left')
			{
				this.scrollPageTargetX = moveX;
			}
			else if (horizontalType === 'right')
			{
				this.scrollPageTargetX = -moveX;
			}
			else if (horizontalType === 'center')
			{
				this.scrollPageTargetX = 0;
			}
			
			this.scrollPageTargetY = -this.board.nativeElement.clientHeight * 0.5 * this.scrollPageTargetZoom
				+ this.board.nativeElement.clientHeight * 0.5;
		}
		else
		{
			this.scrollPageTargetZoom = 1;
			
			this.scrollPageTargetX = 0;
			this.scrollPageTargetY = 0;
		}
	}
	
	protected onClickTopic(topic: TopicModel): void
	{
		if (this.gameService.currentTopic)
		{
			return;
		}
		
		this.soundService.playSound(SoundNameEnum.click, true);
		this.soundService.playSound(SoundNameEnum.buttonSelected, true);
		
		this.signalIsChooseTextEnabled.set(false); // disable choose category text
		
		const horizontalType = this.getHorizontalTypeFromTopic(topic);
		
		this.setScrollPageZoom(horizontalType);
		
		this.gameService.setCurrentTopic(topic.id);//, true);
		
		/*this.topicAniTimeoutSubscription = UtilTimeout.setTimeout(
			() => {
				this.topicAniTimeoutSubscription = null;
				this.initService.navigateToRoute(AppRoutesEnum.game).then();
			}, 2000
		);*/
	}
	
	private getHorizontalTypeFromTopic(topic: TopicModel): 'left' | 'center' | 'right'
	{
		if (topic === this.signalTopic1() && this.signalTopic2())
		{
			return 'left';
		}
		else if (topic === this.signalTopic2() && this.signalTopic1())
		{
			return 'right';
		}
		
		return 'center';
	}
	
	private loop(delta: number): void
	{
		this.update(delta);
	}
	
	private update(delta: number)
	{
		this.appIntervalService.update(delta);
		
		let speed: number = 0.0008; // 0.001;
		let isZooming: boolean = false;
		
		// zoom content
		if (this.signalPageZoom() !== this.scrollPageTargetZoom)
		{
			const zoomDifference: number = this.scrollPageTargetZoom - this.signalPageZoom();
			const zoomSpeed: number = 0.003;
			
			if (Math.abs(zoomDifference) > 0.001)
			{
				speed = zoomSpeed;
				isZooming = true;
				this.signalPageZoom.set(this.signalPageZoom() + zoomDifference * zoomSpeed * delta);
			}
			else
			{
				// Snap to target when very close
				this.signalPageZoom.set(this.scrollPageTargetZoom);
			}
		}
		
		// move content
		const point2: Point2DInterface = {x: this.signalScrollPageX(), y: this.signalScrollPageY()};
		const targetPos: Point2DInterface = {x: this.scrollPageTargetX, y: this.scrollPageTargetY};
		
		// velocity to target position
		let distance: number = this.gameService.getDistance(targetPos, point2);
		if (distance > 10)
		{
			// update opacity when reaching zoom target
			if (isZooming && distance < 600)
			{
				this.signalPageOpacity.set(Math.max(distance / 600 - 0.1, 0));
			}
			
			// snap to target and navigate directly when the zoom ends
			if (isZooming && distance < 30)
			{
				this.onEndZoom(targetPos);
				return;
			}
				// Snap to target when very close, but only when not zooming
			// this helps to avoid slow speed at the end movement
			else if (!isZooming && distance < 200 && distance > 100)
			{
				distance = 200;
			}
			
			const angle: number = this.gameService.getRotationRadianAngle(point2, targetPos);
			const velocityX = Math.cos(angle) * distance;
			const velocityY = Math.sin(angle) * distance;
			
			this.signalScrollPageX.set(this.signalScrollPageX() + velocityX * speed * delta);
			this.signalScrollPageY.set(this.signalScrollPageY() + velocityY * speed * delta);
		}
		
		if (this.buttonXPlusDown)
		{
			this.signalScrollPageX.set(this.signalScrollPageX() + 1.2 * delta);
		}
		if (this.buttonXMinusDown)
		{
			this.signalScrollPageX.set(this.signalScrollPageX() - 1.2 * delta);
		}
		if (this.buttonYPlusDown)
		{
			this.signalScrollPageY.set(this.signalScrollPageY() + 1.2 * delta);
		}
		if (this.buttonYMinusDown)
		{
			this.signalScrollPageY.set(this.signalScrollPageY() - 1.2 * delta);
		}
	}
	
	private onEndZoom(targetPos: Point2DInterface): void
	{
		this.signalScrollPageX.set(targetPos.x);
		this.signalScrollPageY.set(targetPos.y);
		this.signalPageZoom.set(this.scrollPageTargetZoom);
		
		this.pageAniTimeoutSubscription?.unsubscribe();
		this.pageAniTimeoutSubscription = null;
		
		this.topicAniTimeoutSubscription = null;
		
		this.initService.navigateToRoute(AppRoutesEnum.game).then();
	}
}
