import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	effect,
	inject,
	OnDestroy,
	OnInit,
	signal,
	ViewChild
} from '@angular/core';
import {GameService} from '../../core/services/game.service';
import {InitService} from '../../core/services/init.service';
import {UtilTimeout} from '../../shared/utils/util-timeout';
import {UserGameService} from '../../core/services/user-game.service';
import {GameCoinsService} from '../../core/services/game-coins.service';
import {GameHeaderService} from '../../core/services/game-header.service';
import {Point2DInterface} from '../../games/interfaces/point-2D.interface';
import {SoundService} from '../../core/services/sound.service';
import {SoundNameEnum} from '../../shared/enums/sound-name.enum';
import {AppConfig} from '../../app.config';
import {UtilString} from '../../shared/utils/util-string';
import {Subscription} from 'rxjs';
import {BackgroundAnimationService} from '../../core/services/background-animation.service';
import {AppRoutesEnum} from '../../app-routes.enum';
import {ImageLoadService} from '../../core/services/image-load.service';
import {
	AniSplitScreenTitleComponent
} from '../../shared/components/ani-split-screen-title/ani-split-screen-title.component';
import {PachinkoComponent} from '../../games/pachinko/pachinko.component';
import {RouletteComponent} from '../../games/roulette/roulette.component';
import {PointShooterComponent} from '../../games/point-shooter/point-shooter.component';
import {SplitScreenAnimationTypeEnum} from '../../shared/enums/split-screen-animation-type.enum';
import {
	AniSplitScreenTitleService
} from '../../shared/components/ani-split-screen-title/ani-split-screen-title.service';

@Component({
	selector: 'app-game-multiplier-page',
	templateUrl: './game-multiplier-page.component.html',
	styleUrl: './game-multiplier-page.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: false
})
export class GameMultiplierPageComponent implements OnInit, AfterViewInit, OnDestroy
{
	protected gameService = inject(GameService);
	protected userGameService = inject(UserGameService);
	protected initService = inject(InitService);
	private gameCoinsService = inject(GameCoinsService);
	private gameHeaderService = inject(GameHeaderService);
	// private backgroundShapeService = inject(BackgroundShapeService);
	// private backgroundImageService = inject(BackgroundImageService);
	private imageLoadService = inject(ImageLoadService);
	private backgroundAnimationService = inject(BackgroundAnimationService);
	private aniSplitScreenTitleService = inject(AniSplitScreenTitleService);
	private soundService = inject(SoundService);
	
	@ViewChild('aniSplitScreenTitleComponent') protected readonly aniSplitScreenTitleComponent?: AniSplitScreenTitleComponent;
	@ViewChild('gameComponent') protected readonly gameComponent?: PachinkoComponent | RouletteComponent | PointShooterComponent;
	
	protected readonly isShowingSolvedDialog = signal<boolean>(false);
	protected readonly signalSplitScreenAnimationType = signal<SplitScreenAnimationTypeEnum>(SplitScreenAnimationTypeEnum.diagonalLeftToRight);
	protected readonly signalSplitScreenColorBg = signal<string>(AppConfig.quizGameDefaultSplitScreenColorBg);
	protected readonly signalSplitScreenBackgroundImage = signal<string>('none');
	
	protected finishBallScores: Array<{ factor: number, scoreBefore: number, scoreAfter: number }> = [];
	protected totalBallScore: number = 0;
	
	private backgroundSoundTimeoutSubscription: Subscription | null = null;
	private finishGameTimeoutSubscription: Subscription | null = null;
	private splitScreenRestartEventSubscription: Subscription | null = null;
	
	protected wasLastGame: boolean = false;
	
	protected readonly AppConfig = AppConfig;
	
	constructor()
	{
		effect(() => {
			if (this.gameService.signalCurrentMultiplierGame())
			{
				//console.log(this.gameService.signalCurrentMultiplierGame());
				UtilTimeout.setTimeout(() => {
					this.soundService.playSound(SoundNameEnum.modalFadeOut, true);
					
					if (!this.aniSplitScreenTitleComponent?.isOpen)
					{
						this.aniSplitScreenTitleComponent?.toggle();
					}
					
					this.gameComponent?.startGame();
				}, 1600);
			}
		});
	}
	
	public ngOnInit(): void
	{
		const nr: string = UtilString.addLeadingZeros(this.gameService.signalCurrentMultiplierGame(), 2);
		const songName: SoundNameEnum = ('gameMultiplierMusic' + nr) as SoundNameEnum;
		
		if (this.gameService.signalCurrentMultiplierGame() === 0)
		{
			this.gameService.signalCurrentMultiplierGame.set(AppConfig.startMultiplierGame);
		}
		/*	this.backgroundShapeService.setShape(new BackgroundShapeModel(
				'100px',
				'0',
				'45px',
				'45px',
				'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1))',
			));*/
		
		let image: HTMLImageElement | null = this.imageLoadService.getImage('crabFrontImage');
		if (image)
		{
			this.backgroundAnimationService.setImageUrls([
				image.src,
				image.src,
				image.src,
				image.src,
				image.src,
				image.src,
				image.src,
				image.src
			], 1);
		}
		
		this.backgroundSoundTimeoutSubscription = UtilTimeout.setTimeout(
			() => {
				this.backgroundSoundTimeoutSubscription = null;
				this.soundService.playBackgroundSound(songName);
			}, 2000
		);
		
		image = this.imageLoadService.getImage('miniGameSplitScreenBgImage');
		if (image)
		{
			this.signalSplitScreenBackgroundImage.set(`url('${image.src}')`);
		}
		
		this.updateSplitScreenBg('start');
		this.splitScreenRestartEventSubscription = this.aniSplitScreenTitleService.eventEmitter.subscribe((event: string) => {
			this.updateSplitScreenBg(event);
		});
	}
	
	public ngAfterViewInit(): void
	{
		/*UtilTimeout.setTimeout(() => {
			this.soundService.playSound(SoundNameEnum.modalFadeOut, true);
			this.aniSplitScreenTitleComponent?.toggle();
			
			this.gameComponent?.startGame();
		}, 1600);*/
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
			//
		}
		
		//if (!animationType)
		{
			animationType = this.gameService.signalGameConfig()?.miniGameSplitScreenAnimationType ?? SplitScreenAnimationTypeEnum.diagonalLeftToRight;
		}
		
		this.signalSplitScreenAnimationType.set(animationType);
		
		//if (!colorBg)
		{
			colorBg = this.gameService.signalGameConfig()?.miniGameSplitScreenColorBg ?? '#d4d4d442';
		}
		
		this.signalSplitScreenColorBg.set(colorBg);
		
		// only use base image if there is no overwriting configuration from category
		//if (!image)
		{
			image = this.imageLoadService.getImage('miniGameSplitScreenBgImage');
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
	
	protected onStartBall(): void
	{
		if (AppConfig.isDebugConsole)
		{
			console.log('startBall');
		}
	}
	
	protected onFinishBall(value: { score: number, position: Point2DInterface }): void
	{
		if (AppConfig.isDebugConsole)
		{
			console.log('finishBall', value);
		}
		
		const scoreBefore: number = this.userGameService.signalGameScore().score;
		const scoreAfter: number = AppConfig.areMultiplierGames ?
			Math.round(scoreBefore * value.score) :
			scoreBefore + value.score;
		
		if (AppConfig.areMultiplierGames)
		{
			this.totalBallScore += Math.round(scoreBefore * value.score);
		}
		else
		{
			this.totalBallScore += value.score;
		}
		
		this.userGameService.setScore(scoreAfter);
		
		this.finishBallScores.push({factor: value.score, scoreBefore: scoreBefore, scoreAfter: scoreAfter});
		
		const targetX: number = 784;
		const targetY: number = 54;
		
		//const rect = this.elementToScale.nativeElement.getBoundingClientRect();
		//const startX: number = event.clientX / this.signalScaling() - rect.left / this.signalScaling() - 40 * this.signalScaling();
		//const startY: number = event.clientY / this.signalScaling() - rect.top / this.signalScaling() - 40 * this.signalScaling();
		const startX: number = value.position.x + 45;// btnPosition.x;
		const startY: number = value.position.y + 45;// btnPosition.y;
		
		this.gameHeaderService.prepareGameScore(this.userGameService.signalGameScore().score);
		
		this.gameCoinsService.start(
			startX, startY, targetX, targetY, 10, () => {
				// console.log('onShrink')
				this.gameHeaderService.updateGameScore();
			}, () => {
				// console.log('onComplete')
			}
		);
	}
	
	protected onFinishGame(value: boolean): void
	{
		if (value)
		{
			//
		}
		// console.log('finishGame', value);
		this.finishGameTimeoutSubscription = UtilTimeout.setTimeout(() => {
			this.finishGameTimeoutSubscription = null;
			
			this.soundService.playSound(SoundNameEnum.multiplierFinish, true);
			
			const maxQuizRoundCount: number = this.gameService.signalGameConfig() ?
				this.gameService.signalGameConfig()!.maxQuizRoundCount : AppConfig.maxQuizRoundCount;
			const wasLastGame: boolean = this.gameService.signalQuizNumber() >= maxQuizRoundCount;
			if (AppConfig.isDebugConsole)
			{
				console.log('quiz:', this.gameService.signalQuizNumber(), 'score:', this.userGameService.signalGameScore())
			}
			
			this.wasLastGame = wasLastGame;
			
			this.isShowingSolvedDialog.set(true);
			this.soundService.playSound('modalFadeIn', true);
			
			/*this.modalService.openModalDialog(
				ModalGameMultiplierSolvedComponent,
				() => {
				
				},
				ModalSizeEnum.fixed,
				'1000px', null,
				true, {
					quizNumber: this.gameService.signalQuizNumber(),
					score: this.userGameService.signalGameScore().score,
					wasLastGame: wasLastGame,
					finishBallScores: this.finishBallScores
					//taskTokens: this.userGameScoreService.taskTokens,
					//timeBonusTokens: this.userGameScoreService.timeBonusTokens,
					//totalPoints: this.userGameScoreService.totalPoints
				}, '', false, true,
				() => {
					//this.userGameService.setIsGameRunning(false);
					//this.userGameService.setTokens(this.userGameScoreService.totalPoints);
					
					if (wasLastGame)
					{
						this.gameService.finishGameFully();
					}
					else
					{
						this.gameService.setQuizNumber(this.gameService.signalQuizNumber() + 1);
						this.initService.navigateToRoute(AppRoutesEnum.gameTopic).then();
					}
				}
			);*/
		}, 1500);
	}
	
	protected exit(): void
	{
		this.isShowingSolvedDialog.set(false);
		this.soundService.playSound('modalFadeOut', true);
		
		UtilTimeout.setTimeout(() => {
			//this.userGameService.setIsGameRunning(false);
			//this.userGameService.setTokens(this.userGameScoreService.totalPoints);
			
			if (this.wasLastGame)
			{
				this.gameService.finishGameFully();
			}
			else
			{
				this.gameService.setQuizNumber(this.gameService.signalQuizNumber() + 1);
				this.initService.navigateToRoute(AppRoutesEnum.gameTopic).then();
			}
		}, 500);
	}
}
