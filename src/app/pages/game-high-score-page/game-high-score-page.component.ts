import {AfterViewInit, Component, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SoundNameEnum} from "../../shared/enums/sound-name.enum";
import {AppRoutesEnum} from "../../app-routes.enum";
import {InitService} from "../../core/services/init.service";
import {SoundService} from "../../core/services/sound.service";
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {GameScoreService} from '../../core/services/game-score.service';
import {GameScoreBackendService} from '../../core/services/game-score-backend.service';
import {GameScoreModel} from '../../shared/models/game-score.model';
import {ActivatedRoute, Router} from '@angular/router';
import {HighscoreTimespanEnum} from '../../shared/enums/highscore-timespan.enum';
import {Subscription} from 'rxjs';
import {ButtonSoundOnOffComponent} from '../../shared/components/button-sound-on-off/button-sound-on-off.component';
import {ButtonFullscreenComponent} from '../../shared/components/button-fullscreen/button-fullscreen.component';
import {ImageLoadService} from '../../core/services/image-load.service';
import {GameService} from '../../core/services/game.service';
import {UserGameService} from '../../core/services/user-game.service';
import {AppConfig} from '../../app.config';

@UntilDestroy()
@Component({
	selector: 'app-game-high-score-page',
	templateUrl: './game-high-score-page.component.html',
	styleUrl: './game-high-score-page.component.scss',
	standalone: false
})
export class GameHighScorePageComponent implements OnInit, AfterViewInit, OnDestroy
{
	protected initService = inject(InitService);
	protected gameService = inject(GameService);
	protected userGameService = inject(UserGameService);
	protected gameScoreBackendService = inject(GameScoreBackendService);
	protected gameScoreService = inject(GameScoreService);
	protected soundService = inject(SoundService);
	private imageLoadService = inject(ImageLoadService);
	protected router = inject(Router);
	private activatedRoute = inject(ActivatedRoute);
	
	@ViewChild("buttonSoundOnOffComponent") buttonSoundOnOffComponent!: ButtonSoundOnOffComponent;
	@ViewChild("buttonFullscreenComponent") buttonFullscreenComponent!: ButtonFullscreenComponent;
	
	public readonly timespanList: Array<{
		url: string,
		localizationKey: string,
		imageKey: string,
		image: string | undefined
	}> = [
		{
			url: AppRoutesEnum.highScoreWeekly,
			localizationKey: 'highscore.weekly',
			imageKey: 'highscoreWeekly',
			image: undefined
		},
		{
			url: AppRoutesEnum.highScoreMonthly,
			localizationKey: 'highscore.monthly',
			imageKey: 'highscoreMonthly',
			image: undefined
		},
		{url: AppRoutesEnum.highScore, localizationKey: 'highscore.all-time', imageKey: 'highscoreAllTime', image: undefined}
	];
	
	protected currentTimespan: string = 'all-time';
	
	private backgroundSoundTimeoutSubscription: Subscription | null = null;
	private addImageSubscription: Subscription | null = null;
	
	protected readonly AppConfig = AppConfig;
	protected readonly SoundNameEnum = SoundNameEnum;
	protected readonly document = document;
	
	public ngOnInit(): void
	{
		if (
			this.initService.isScormPackage ||
			this.gameService.signalGameConfig() && !this.gameService.signalGameConfig()!.includesHighscore
		)
		{
			this.initService.navigateToRoute(AppRoutesEnum.base).then();
			return;
		}
		
		const url: string | undefined = this.activatedRoute.snapshot.routeConfig?.path;
		let timespan: string = HighscoreTimespanEnum.allTime;
		
		if (url && url !== AppRoutesEnum.highScore)
		{
			timespan = (url as HighscoreTimespanEnum).substring('high-score-'.length);
		}
		
		if (timespan === HighscoreTimespanEnum.allTime)
		{
			this.currentTimespan = 'all-time';
		}
		else
		{
			this.currentTimespan = timespan;
		}
		
		this.gameScoreBackendService.getHighScore(timespan as HighscoreTimespanEnum).pipe(untilDestroyed(this)).subscribe(
			{
				next: (highScores: Array<GameScoreModel> | null) => {
					if (highScores)
					{
						this.gameScoreService.setScores(highScores);
					}
				},
				error: (error: string) => {
					console.error(error);
				}
			}
		);
		
		// set to no change
		// if it is not coming from the end game page, to go back
		/*if (this.gameService.highscorePageBackRoute !== AppRoutesEnum.endGame)
		{
			this.backgroundSoundTimeoutSubscription = UtilTimeout.setTimeout(
				() => {
					this.backgroundSoundTimeoutSubscription = null;
					this.soundService.playBackgroundSound(SoundNameEnum.introMusic);
				}, 500
			);
		}*/
		
		this.addImageSubscription = this.imageLoadService.addImageEmitter.subscribe((id: string) => {
			if (
				id === 'btnSoundOn' ||
				id === 'btnSoundOff' ||
				id === 'btnFullscreenOn' ||
				id === 'btnFullscreenOff' ||
				this.isHighscoreImage(id)
			)
			{
				this.getImages();
			}
		});
	}
	
	private isHighscoreImage(id: string): boolean
	{
		for (const timespan of this.timespanList)
		{
			if (id === timespan.imageKey)
			{
				return true;
			}
		}
		
		return false;
	}
	
	public ngAfterViewInit(): void
	{
		if (
			this.initService.isScormPackage ||
			this.gameService.signalGameConfig() && !this.gameService.signalGameConfig()!.includesHighscore
		)
		{
			return;
		}
		
		this.getImages();
	}
	
	public ngOnDestroy(): void
	{
		if (this.backgroundSoundTimeoutSubscription)
		{
			this.backgroundSoundTimeoutSubscription.unsubscribe();
			this.backgroundSoundTimeoutSubscription = null;
		}
		
		if (this.addImageSubscription)
		{
			this.addImageSubscription.unsubscribe();
			this.addImageSubscription = null;
		}
	}
	
	protected onClickTimespan(timespan: string): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		this.initService.navigateToRoute(timespan).then();
	}
	
	protected onClickClose(): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		this.initService.navigateToRoute(this.gameService.highscorePageBackRoute).then();
	}
	
	private getImages(): void
	{
		const imageSoundOnUrl: HTMLImageElement | null = this.imageLoadService.getImage('btnSoundOn');
		const imageSoundOffUrl: HTMLImageElement | null = this.imageLoadService.getImage('btnSoundOff');
		const imageFullscreenOn: HTMLImageElement | null = this.imageLoadService.getImage('btnFullscreenOn');
		const imageFullscreenOff: HTMLImageElement | null = this.imageLoadService.getImage('btnFullscreenOff');
		
		if (imageSoundOnUrl && imageSoundOffUrl && imageFullscreenOn && imageFullscreenOff)
		{
			this.buttonFullscreenComponent.initImages(imageFullscreenOn.src, imageFullscreenOff.src);
			this.buttonSoundOnOffComponent.initImages(imageSoundOnUrl.src, imageSoundOffUrl.src);
		}
		
		let image: HTMLImageElement | null;
		for (const timespan of this.timespanList)
		{
			image = this.imageLoadService.getImage(timespan.imageKey);
			if (image)
			{
				timespan.image = `url('${image.src}')`;
			}
		}
	}
}
