import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	HostListener,
	inject,
	OnDestroy,
	OnInit,
	signal,
	ViewChild,
	WritableSignal
} from '@angular/core';
import {NavigationEnd, NavigationStart, Router} from '@angular/router';
import {Meta, Title} from '@angular/platform-browser';
import {InitService} from './core/services/init.service';
import {PageService} from './core/services/page.service';
import {UtilTimeout} from './shared/utils/util-timeout';
import {AppConfig} from './app.config';
import {FileLoadService} from './core/services/file-load.service';
import {ImageLoadService} from './core/services/image-load.service';
import {SoundService} from './core/services/sound.service';
import {UtilHttp} from './shared/utils/util-http';
import {AppRoutesEnum} from './app-routes.enum';
import {NativeTranslateService} from './core/services/native-translate.service';
import {Subscription} from 'rxjs';
import {PanelService} from './core/services/panel.service';
import {LocaleEnum} from './shared/enums/locale.enum';
import {BackgroundImageService} from './core/services/background-image.service';
import {GameCoinsComponent} from './core/components/game-coins/game-coins.component';
import {GameHeaderComponent} from './core/components/game-header/game-header.component';
import {GameCoinsService} from './core/services/game-coins.service';
import {SoundNameEnum} from './shared/enums/sound-name.enum';
import {StopTypeEnum} from './games/enums/stop-type.enum';
import {BackgroundGradientService} from './core/services/background-gradient.service';
import {BackgroundAnimationService} from './core/services/background-animation.service';
import {BackgroundShapeService} from './core/services/background-shape.service';
import {GameService} from './core/services/game.service';
import {FontStyleService} from './core/services/font-style.service';
import {IframeEventRuleService} from './core/services/iframe-event-rule.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {ScormService} from './core/services/scorm.service';
import {BackgroundAnimationTypeEnum} from './shared/enums/background-animation-type.enum';
import {SwipeYesNoService} from './games/swipe-yes-no/services/swipe-yes-no.service';

@UntilDestroy()
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: false
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy
{
	protected pageService = inject(PageService);
	protected panelService = inject(PanelService);
	protected fileLoadService = inject(FileLoadService);
	protected initService = inject(InitService);
	private imageLoadService = inject(ImageLoadService);
	protected gameService = inject(GameService);
	private gameCoinsService = inject(GameCoinsService);
	private soundService = inject(SoundService);
	protected backgroundShapeService = inject(BackgroundShapeService);
	protected backgroundImageService = inject(BackgroundImageService);
	protected backgroundGradientService = inject(BackgroundGradientService);
	protected backgroundAnimationService = inject(BackgroundAnimationService);
	protected fontStyleService = inject(FontStyleService);
	private nativeTranslateService = inject(NativeTranslateService);
	// private appBackendConfigService = inject(AppBackendConfigService);
	protected swipeYesNoService = inject(SwipeYesNoService);
	private iFrameEventRuleService = inject(IframeEventRuleService);
	private scormService = inject(ScormService);
	private router = inject(Router);
	// private contexts = inject(ChildrenOutletContexts);
	private titleService = inject(Title);
	private metaService = inject(Meta);
	private changeDetectorRef = inject(ChangeDetectorRef);
	
	@ViewChild("overlayContainer") overlayContainer!: ElementRef<HTMLDivElement>;
	@ViewChild("elementToScale") elementToScale!: ElementRef<HTMLDivElement>;
	@ViewChild("main") main!: ElementRef<HTMLDivElement>;
	@ViewChild("gameHeader") gameHeaderComponent!: GameHeaderComponent;
	@ViewChild("gameCoins") gameCoinsComponent!: GameCoinsComponent;
	
	// @ViewChildren("video") videoElements!: QueryList<ElementRef<HTMLVideoElement>>;
	protected readonly signalIsInlineConsoleVisible = signal<boolean>(AppConfig.isInlineConsoleVisible);
	protected readonly signalBackgroundImage: WritableSignal<string | null> = signal<string | null>(null);
	
	public readonly signalPageWidth = signal<number>(0);
	public readonly signalPageHeight = signal<number>(0);
	public readonly signalScaleHeight = signal<number>(0);
	public readonly signalScaleMargin = signal<string>('0');
	public readonly signalScaleTransform = signal<string>('none');
	public readonly signalScaling = signal<number>(1);
	
	private readonly appWidth: number = 1620;
	private readonly appHeight: number = 2160;
	
	private nfcUserHasChangedSubscription!: Subscription;
	
	constructor()
	{
		/*if (this.initService.doDevUrlCleanup())
		{
			return;
		}*/
		
		// console.log(this.initService.signalAppQueryParams());
		
		/*let list: Array<number> = [];
		for (let i = 0; i < 300; ++i)
		{
			list.push(i + 1);
		}
		console.log(list);
		list = UtilArray.shuffleArray(list);
		console.log(list);*/
		
		// this.soundService.unlockAudioContext();
		
		//this.mushroomButtonInputService.init();
		/*if (this.appBackendConfigService.appBackendConfig)
		{
			if (this.appBackendConfigService.appBackendConfig.mushroomButtons)
			{
				this.mushroomButtonInputService.setButtons(
					this.appBackendConfigService.appBackendConfig.mushroomButtons
				);
			}
		}*/
		
		// console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
		// console.log('Node.js childProcess', this.electronService.childProcess);
		//	this.electronService.getConfig();
		//	this.electronService.loadCSV();
		
		if (this.gameService.signalGameConfig())
		{
			if (this.gameService.signalGameConfig()!.backgroundColors)
			{
				this.backgroundGradientService.init(this.gameService.signalGameConfig()!.backgroundColors!, this.gameService.signalGameConfig()!.backgroundColorsDuration);
			}
			
			if (this.gameService.signalGameConfig()!.mainFont.length > 0)
			{
				this.fontStyleService.applyFont(
					'MainFont',
					this.gameService.signalGameConfig()!.mainFont,
					true
				);
			}
		}
		
		this.router.events.pipe(untilDestroyed(this)).subscribe((event) => {
			if (event instanceof NavigationStart) // Navigation is starting...
			{
				const url: string = event.url.split('?')[0];
				
				// prevent moving elements at route animation
				if (this.main?.nativeElement)
				{
					this.main.nativeElement.scrollTo(0, 0);
				}
				
				this.pageService.updateRoute(url, []);// this.videoElements ? this.videoElements.toArray() : []);
				this.panelService.updateRoute(url);
				this.backgroundShapeService.updateRoute(url);
				this.backgroundImageService.updateRoute(url);
				this.backgroundGradientService.updateRoute(url);
				this.backgroundAnimationService.updateRoute(
					url,
					this.gameService.signalGameConfig()?.backgroundAnimationImageUrls ?? null,
					this.gameService.signalGameConfig() ?
						this.gameService.signalGameConfig()!.backgroundAnimationType :
						BackgroundAnimationTypeEnum.oneStep
				);
				//this.stillThereService.updateRoute(url);
				
				//this.soundService.fadeOutSound('taskMusic', 1000, StopTypeEnum.stop);
				this.soundService.fadeOutSound(SoundNameEnum.chooseTopicMusic01, 500, StopTypeEnum.stop);
				this.soundService.fadeOutSound(SoundNameEnum.mainMusic01, 500, StopTypeEnum.stop);
				this.soundService.fadeOutSound(SoundNameEnum.mainMusic02, 500, StopTypeEnum.stop);
				this.soundService.fadeOutSound(SoundNameEnum.mainMusic03, 500, StopTypeEnum.stop);
				this.soundService.fadeOutSound(SoundNameEnum.gameMultiplierMusic01, 500, StopTypeEnum.stop);
				this.soundService.fadeOutSound(SoundNameEnum.gameMultiplierMusic02, 500, StopTypeEnum.stop);
				this.soundService.fadeOutSound(SoundNameEnum.gameMultiplierMusic03, 500, StopTypeEnum.stop);
				//		this.soundService.fadeOutSound(SoundNameEnum.introMusic, 500, StopTypeEnum.stop); // turned off - important for menu switch
				// this.soundService.fadeOutSound(SoundNameEnum.endGameMusic, 500, StopTypeEnum.stop);
			}
			else if (event instanceof NavigationEnd) // Navigation is starting...
			{
				const url: string = event.url.split('?')[0];
				
				if (this.initService.checkSelectedRoute(url))
				{
					this.gameCoinsService.stop();
				}
				//	this.routeAnimationData = this.getRouteAnimationData();
			}
		});
		// console.log(this.appBackendConfigService.appBackendConfig)
		//const route: AppRoutesEnum = !!this.appBackendConfigService.appBackendConfig ? AppConfig.startRoute : AppRoutesEnum.base;
	}
	
	public ngOnInit(): void
	{
		this.initLocalization().then(() => {
			if (this.gameService.signalGameConfig())
			{
				const quizName: string = this.nativeTranslateService.instant('quiz-name');
				this.titleService.setTitle(quizName);
				this.metaService.updateTag({property: 'og:title', content: quizName});
			}
			else
			{
				this.titleService.setTitle('ROY 50/50 Speed Quiz');
			}
		});
		
		this.onResize();
		
		// use debug from URL for showing debug info console
		// https://editor-speed-quiz.r-o-y.de/?debug=true
		if (this.initService.signalAppQueryParams() && this.initService.signalAppQueryParams().debug)
		{
			this.signalIsInlineConsoleVisible.set(true);
		}
		
		this.initGameTitleImage();
		this.initBackgroundImage();
		this.initSwipeYesNoGameBaseSettings();
		this.initIFrameSubscription();
	}
	
	public ngAfterViewInit(): void
	{
		//this.initSounds();
		//this.initImages();
		this.onResize();
		
		if (this.initService.isScormPackage)
		{
			this.initScorm();
		}
		
		/*this.elementToScale.nativeElement.addEventListener('click', (event) => {
			const rect = this.elementToScale.nativeElement.getBoundingClientRect();
			const startX: number = event.clientX / this.signalScaling() - rect.left / this.signalScaling();
			const startY: number = event.clientY / this.signalScaling() - rect.top / this.signalScaling();
			const targetX: number = 760; // event.clientX / this.signalScaling() - rect.left / this.signalScaling() - 40 * this.signalScaling();
			const targetY: number = 30; // event.clientY / this.signalScaling() - rect.top / this.signalScaling() - 40 * this.signalScaling();
			console.log(startX, startY, targetX, targetY)

			this.userGameService.setScore(this.userGameService.signalGameScore().score + 100);

			this.gameCoinsService.start(
				startX, startY, targetX, targetY, 10, () => {
					// console.log('onShrink')
					this.gameHeaderService.updateGameScore(this.userGameService.signalGameScore().score);
				}, () => {
					// console.log('onComplete')
				}
			);
		});*/
		
		UtilTimeout.setTimeout(() => {
			const loadObjs: Array<{ name: SoundNameEnum | string, url: string }> = this.getLoadObjectList();
			
			this.loadFiles(loadObjs).then((files: Array<{ name: string, blob: Blob }>): void => {
				// let i: number = 0;
				
				/*this.videoService.setVideoBlobInHTMLVideoElement('videoMain', this.videoElements.toArray(), files[0].blob);
				this.videoService.setVideoBlobInHTMLVideoElement('videoPachinko', this.videoElements.toArray(), files[1].blob);
	
				i = 2;
				this.soundService.addSound('taskFinish', files[i++].blob, 0.5);
				this.soundService.addSound('multiplierFinish', files[i++].blob, 0.7);
				this.soundService.addBackgroundSound('mainMusic', files[i++].blob, 0.3);
				this.soundService.addBackgroundSound('taskMusic', files[i++].blob, 0.3);
				this.soundService.addBackgroundSound('gameMultiplierMusic', files[i++].blob, 0.3);*/
				
				// shift images to image load service
				for (const file of files)
				{
					if (file.blob.type === 'image/jpeg' || file.blob.type === 'image/png' || file.blob.type === 'image/svg+xml')
					{
						this.imageLoadService.addImage(file.name, file.blob);
						// i++;
					}
				}
				
				// shift sounds to sound service
				for (const file of files)
				{
					if (file.blob.type === 'audio/mpeg' || file.blob.type === 'audio/wav')
					{
						if (file.name.indexOf('Music') !== -1)
						{
							this.soundService.addBackgroundSound(file.name, file.blob, 0.4);
						}
						else
						{
							this.soundService.addSound(file.name, file.blob, 1);
						}
						// i++;
					}
				}
				
				// this.playVideo();
				this.gameHeaderComponent.init();
				this.gameCoinsService.init(
					this.gameService.signalGameConfig() ?
						this.gameService.signalGameConfig()!.isRotatingFlyingAni : true
				);
				
				const image: HTMLImageElement | null = this.imageLoadService.getImage('btnBackground');
				if (image)
				{
					this.initService.signalBtnBackgroundImageUrl.set(`url('${image.src}')`);
				}
				
				//const route: AppRoutesEnum = !!this.appBackendConfigService.appBackendConfig ? AppConfig.startRoute : AppRoutesEnum.base;
				const route: AppRoutesEnum = AppConfig.startRoute;
				
				if (AppConfig.startRoute !== AppRoutesEnum.base)
				{
					UtilTimeout.setTimeout(() => {
						this.initService.navigateToRoute(route).then(
							() => {
								UtilTimeout.setTimeout(
									() => {
										this.changeDetectorRef.detectChanges();
									}, 100
								);
							}
						);
					}, 300);
				}
			});
		}, 100);
	}
	
	public ngOnDestroy(): void
	{
		this.nfcUserHasChangedSubscription.unsubscribe();
		this.soundService.stopAllBackgroundSounds();
		
		this.iFrameEventRuleService.destroy();
	}
	
	@HostListener('window:resize', [])
	public onResize(): void
	{
		function calculateMaxSize()
		{
			const innerWidth = window.innerWidth;
			const innerHeight = window.innerHeight;
			
			const targetAspectRatio = 3 / 4;
			
			let maxWidth, maxHeight;
			
			if (innerWidth / innerHeight > targetAspectRatio)
			{
				// the window is wider than the desired aspect ratio
				maxWidth = innerHeight * targetAspectRatio;
				maxHeight = innerHeight;
			}
			else
			{
				// the window is higher than the desired aspect ratio
				maxWidth = innerWidth;
				maxHeight = innerWidth / targetAspectRatio;
			}
			
			maxWidth = Math.ceil(maxWidth + 1);
			maxHeight = Math.ceil(maxHeight + 1);
			
			if (window.innerHeight > maxHeight)
			{
				maxHeight = window.innerHeight;
				// console.log('larger');
			}
			
			return {width: maxWidth, height: maxHeight};
		}
		
		const resize = () => {
			const result = calculateMaxSize();
			// console.log(`Max width: ${result.width}, Max height: ${result.height}`);
			
			this.signalPageWidth.set(result.width);
			this.signalPageHeight.set(result.height);
			
			//	const baseFontSize = 16; // Die gewünschte Basis-Schriftgröße in px
			//	const scaleFactor = result.width / 1200; // Faktor basierend auf der Bildschirmbreite
			
			//	const newFontSize = baseFontSize * scaleFactor;
			//	document.body.style.fontSize = newFontSize + 'px';
			this.fitToParent();
			
			//this.modalService.onResize(this.signalScaling());
			this.backgroundAnimationService.onResize(this.signalPageHeight() / this.signalScaling());
		}
		
		UtilTimeout.setTimeout(
			() => {
				resize();
				UtilTimeout.setTimeout(
					() => {
						resize();
					}, 200
				);
			}, 200
		);
	}
	
	public scaleAmountNeededToFit(): number
	{
		const margin = parseInt(this.signalScaleMargin(), 10);
		
		if (!this.overlayContainer)
		{
			return 1;
		}
		
		const clientWidth = this.overlayContainer!.nativeElement.clientWidth - margin * 2;
		const clientHeight = this.overlayContainer!.nativeElement.clientHeight - margin * 2;
		const width = this.appWidth;
		const height = this.appHeight;
		
		return Math.min(clientWidth / width, clientHeight / height);
	}
	
	public fitToParent()
	{
		this.signalScaling.set(this.scaleAmountNeededToFit());
		this.signalScaleTransform.set(`translate(0, 0) scale(${this.signalScaling()})`);
		this.signalScaleHeight.set(window.innerHeight / this.signalScaling()); // add special height
	}
	
	/*public onAway(): void
	{
		this.stillThereService.resetTimer();
		this.initService.navigateToRoute(AppRoutesEnum.base).then();
	}*/
	
	/*protected onClickExit(): void
	{
		window.location.href = this.initService.signalReferrerUrl();
	}*/
	
	private getLoadObjectList(): Array<{ name: SoundNameEnum | string, url: string }>
	{
		const loadObjs: Array<{ name: SoundNameEnum | string, url: string }> = [];
		
		const soundDefinitions: Record<string, string> | null = this.gameService.signalGameConfig()?.soundDefinitions ?? null;
		let companyPath: string = '';
		//	let quizGamePath: string = '';
		if (this.gameService.signalGameConfig())
		{
			companyPath = this.gameService.signalGameConfig()?.companyPath + '/';
			// quizGamePath = this.gameService.signalGameConfig()?.quizGamePath + '/';
		}
		
		const baseSoundPath: string = 'assets/sounds/';
		const swipeYesNoPath: string = 'assets/games/swipe-yes-no/';
		const ballGamePath: string = 'assets/games/ball-game/';
		const pachinkoPath: string = 'assets/games/pachinko/';
		const roulettePath: string = 'assets/games/roulette/';
		const pointShooterPath: string = 'assets/games/point-shooter/';
		const hasMiniGamePachinko: boolean = !this.gameService.signalGameConfig() ||
			(this.gameService.signalGameConfig()?.activeMiniGames.includes(1) ?? false);
		const hasMiniGameRoulette: boolean = !this.gameService.signalGameConfig() ||
			(this.gameService.signalGameConfig()?.activeMiniGames.includes(2) ?? false);
		const hasMiniGamePointShooter: boolean = !this.gameService.signalGameConfig()
			|| (this.gameService.signalGameConfig()?.activeMiniGames.includes(3) ?? false);
		
		/*
		key = Sound definition key
		sG = Sound game key
		path = Special path to the sound file
		oUrl = Original sound file name
		 */
		const soundBase: Array<{ key: string, sG?: string, path?: string, oUrl: string }> = [
			{key: "mainScreen", sG: SoundNameEnum.introMusic, oUrl: 'music-main-screen.mp3'}, // DnB - Flow Loop.mp3
			{key: "categorySelection", sG: SoundNameEnum.chooseTopicMusic01, oUrl: 'music-category-selection.mp3'}, // DnB - Heart Strings Loop.mp3
			{key: "quizGame", sG: SoundNameEnum.mainMusic01, oUrl: 'music-quiz-game.mp3'}, // Comedic - Clumsy Mime Loop.mp3
			// {key: "quizGame", sG: SoundNameEnum.mainMusic02, oUrl: 'music-quiz-game.mp3'},
			// {key: "quizGame", sG: SoundNameEnum.mainMusic03, oUrl: 'music-quiz-game.mp3'},
			{key: "endScreen", sG: SoundNameEnum.endGameMusic, oUrl: 'music-end-game.mp3'}, // DnB - Rain Walker Loop.mp3
			{key: SoundNameEnum.click, oUrl: 'click.mp3'},
			{key: SoundNameEnum.modalFadeIn, oUrl: 'modal-fade-in.mp3'},
			{key: SoundNameEnum.modalFadeOut, oUrl: 'modal-fade-out.mp3'},
			{key: SoundNameEnum.buttonSelected, oUrl: 'button-selected.mp3'}, // Spiritual Weapon.mp3
			{key: SoundNameEnum.cardFadeIn, oUrl: 'card-fade-in.mp3'},
			{key: SoundNameEnum.cardFadeOut, oUrl: 'card-fade-out.mp3'},
			{key: SoundNameEnum.answerRight, oUrl: 'answer-right.mp3'},
			{key: SoundNameEnum.answerWrong, oUrl: 'answer-wrong.mp3'},
			{key: SoundNameEnum.categoryFlash, oUrl: 'category-flash.mp3'},
			{key: SoundNameEnum.scoreArrive, oUrl: 'score-arrive.mp3'},
			{key: SoundNameEnum.endGame, oUrl: 'end-game.mp3'},
		];
		
		if (hasMiniGamePachinko || hasMiniGameRoulette || hasMiniGamePointShooter)
		{
			soundBase.push(
				{key: 'dropIn', path: ballGamePath + 'sounds/', oUrl: `drop-in.mp3`},
				{key: 'bowDraw', path: ballGamePath + 'sounds/', oUrl: `bow-draw.mp3`}
			);
			
			for (let i = 1; i <= 4; i++)
			{
				soundBase.push({
					key: 'ballCollision' + i,
					path: ballGamePath + 'sounds/',
					oUrl: `ball-collision${(i < 10 ? '0' : '') + i}.mp3`
				});
			}
			for (let i = 1; i <= 5; i++)
			{
				soundBase.push({
					key: `coinTarget${(i < 10 ? '0' : '') + i}`,
					path: ballGamePath + 'sounds/',
					oUrl: `coin-target${(i < 10 ? '0' : '') + i}.mp3`
				});
			}
		}
		
		// minigame pachinko
		if (hasMiniGamePachinko)
		{
			soundBase.push(
				{key: "miniGamePachinko", sG: SoundNameEnum.gameMultiplierMusic01, oUrl: 'music-pachinko.mp3'}, // 8BitVol2 - Dust Loop.mp3
				{key: 'pachinkoStart', path: pachinkoPath + 'sounds/', oUrl: 'start.mp3'}
			);
			for (let i = 1; i <= 4; i++)
			{
				soundBase.push({
					key: 'pachinkoNail' + i,
					path: pachinkoPath + 'sounds/',
					oUrl: 'nail' + (i < 10 ? '0' : '') + i + '.mp3'
				});
			}
		}
		
		// minigame roulette
		if (hasMiniGameRoulette)
		{
			soundBase.push(
				{key: "miniGameRoulette", sG: SoundNameEnum.gameMultiplierMusic02, oUrl: 'music-roulette.mp3'}, // 8BitVol2 - Gas Loop.mp3
				{key: 'rouletteStart', path: roulettePath + 'sounds/', oUrl: 'start.mp3'},
				{key: 'rouletteStep', path: roulettePath + 'sounds/', oUrl: 'step.mp3'},
				{key: 'rouletteLogin', path: roulettePath + 'sounds/', oUrl: 'login.mp3'},
				{key: 'rouletteLock', path: roulettePath + 'sounds/', oUrl: 'lock.mp3'},
				{key: 'rouletteRolling01', path: roulettePath + 'sounds/', oUrl: 'rolling01.mp3'},
				{key: 'rouletteRolling02', path: roulettePath + 'sounds/', oUrl: 'rolling02.mp3'},
				{key: 'rouletteRolling03', path: roulettePath + 'sounds/', oUrl: 'rolling03.mp3'}
			);
		}
		
		// minigame point shooter
		if (hasMiniGamePointShooter)
		{
			soundBase.push(
				{key: "miniGamePointShooter", sG: SoundNameEnum.gameMultiplierMusic03, oUrl: 'music-point-shooter.mp3'}, // 8BitVol2 - Fun Loop.mp3
				{key: 'pointShooterStart', path: pointShooterPath + 'sounds/', oUrl: 'start.mp3'}
			);
		}
		
		for (const value of soundBase)
		{
			// if the sG value is defined, use it - it is an internal game key
			const soundKey: string = value.sG ? value.sG : value.key;
			
			if (soundDefinitions && soundDefinitions[value.key])
			{
				if (soundDefinitions[value.key] !== 'no-sound')
				{
					const filename: string = soundDefinitions[value.key];
					const soundUrl: string = this.gameService.signalGameConfig()!.isFtpReady ?
						`${filename}` : `../${companyPath}${filename}`;
					
					loadObjs.push({name: soundKey, url: soundUrl});
				}
			}
			else
			{
				const path: string = value.path ? value.path : baseSoundPath;
				loadObjs.push({name: soundKey, url: path + value.oUrl});
			}
		}
		
		const swipeImagePath: string | null = this.getSwipeYesNoSwipeImagePath(swipeYesNoPath);
		if (swipeImagePath)
		{
			loadObjs.push({name: 'swipeYesNoSwipeLeftRightImage', url: swipeImagePath});
		}
		
		const greatImagePath: string | null = this.getSwipeYesNoGreatImagePath(swipeYesNoPath);
		if (greatImagePath)
		{
			loadObjs.push({name: 'swipeYesNoGreatImage', url: greatImagePath});
		}
		
		loadObjs.push(
			{name: 'swipeYesNoBtnCorrectImage', url: swipeYesNoPath + 'images/quiz_assets_right.svg'},
			{name: 'swipeYesNoBtnNotCorrectImage', url: swipeYesNoPath + 'images/quiz_assets_wrong.svg'},
			{name: 'swipeYesNoBtnQuestionImage', url: swipeYesNoPath + 'images/btn-question.png'},
			//{name: 'swipeYesNoGreatImage', url: swipeYesNoPath + 'images/great.png'}, // replaced by editor value
			//{name: 'swipeYesNoSwipeLeftRightImage', url: swipeYesNoPath + 'images/swipe-left-right.png'}, // replaced by editor value
			{name: 'btnBackground', url: 'assets/images/btn-bg01.png'},
			{name: 'btnClose', url: 'assets/images/icons/btn-close.png'},
			{name: 'btnSoundOn', url: 'assets/images/icons/btn-sound-on.png'},
			{name: 'btnSoundOff', url: 'assets/images/icons/btn-sound-off.png'},
			{name: 'btnFullscreenOn', url: 'assets/images/icons/btn-fullscreen-on.png'},
			{name: 'btnFullscreenOff', url: 'assets/images/icons/btn-fullscreen-off.png'},
			{name: 'giftClosedImage', url: 'assets/images/icons/gift-closed.png'},
			{name: 'giftOpenImage', url: 'assets/images/icons/gift-open.png'},
			{name: 'btnPlayImage', url: 'assets/images/btn-play.png'},
			{name: 'starImage', url: 'assets/images/svg/star.svg'},
			{name: 'iconReviewCorrect', url: 'assets/images/svg/icon-review-correct.svg'},
			{name: 'iconReviewWrong', url: 'assets/images/svg/icon-review-wrong.svg'},
			{name: 'arrowsDown', url: 'assets/images/svg/arrows-down.svg'},
			{name: 'highscoreAllTime', url: 'assets/images/svg/highscore-all-time.svg'},
			{name: 'highscoreMonthly', url: 'assets/images/svg/highscore-monthly.svg'},
			{name: 'highscoreWeekly', url: 'assets/images/svg/highscore-weekly.svg'}
			// {name: 'howToPlay01', url: 'assets/images/how-to-play.png'}
		);
		
		// set special score animation image
		if (this.gameService.signalGameConfig())
		{
			if (this.gameService.signalGameConfig()!.imageScoreAni)
			{
				const qz: string | null = this.initService.qz;
				let imageUrl: string | null = null;
				
				if (this.gameService.signalGameConfig()!.isFtpReady)
				{
					imageUrl = `assets/images/${this.gameService.signalGameConfig()!.imageScoreAni}.png`;
				}
				else if (qz)
				{
					imageUrl = `../uploads/quiz-game/${qz}/images/${this.gameService.signalGameConfig()!.imageScoreAni}.png`;
				}
				
				if (imageUrl)
				{
					loadObjs.push(
						{name: 'crabFrontImage', url: imageUrl},
						{name: 'crabBackImage', url: imageUrl}
					);
				}
			}
		}
		else // base game image
		{
			loadObjs.push(
				{name: 'crabFrontImage', url: 'assets/images/crab01-front.png'},
				{name: 'crabBackImage', url: 'assets/images/crab01-back.png'}
			);
		}
		
		this.updateCompanyLogoImage(loadObjs);
		
		// split screen background image
		if (this.gameService.signalGameConfig() && this.gameService.signalGameConfig()!.imageSplitScreenBg)
		{
			const qz: string | null = this.initService.qz;
			let imageUrl: string | null = null;
			
			if (this.gameService.signalGameConfig()!.isFtpReady)
			{
				imageUrl = `assets/images/${this.gameService.signalGameConfig()!.imageSplitScreenBg!}.png`;
			}
			else if (qz)
			{
				imageUrl = `../uploads/quiz-game/${qz}/images/${this.gameService.signalGameConfig()!.imageSplitScreenBg!}.png`;
			}
			
			if (imageUrl)
			{
				loadObjs.push({name: 'splitScreenBgImage', url: imageUrl});
			}
			/*else
			{
				loadObjs.push({name: 'splitScreenBgImage', url: 'assets/images/svg/ROY_white_full_coloured.svg'});
			}*/
		}
		/*else
		{
			loadObjs.push({name: 'splitScreenBgImage', url: 'assets/images/svg/ROY_white_full_coloured.svg'});
		}*/
		
		// split screen background image
		if (this.gameService.signalGameConfig() && this.gameService.signalGameConfig()!.imageMiniGameSplitScreenBg)
		{
			const qz: string | null = this.initService.qz;
			let imageUrl: string | null = null;
			
			if (this.gameService.signalGameConfig()!.isFtpReady)
			{
				imageUrl = `assets/images/${this.gameService.signalGameConfig()!.imageMiniGameSplitScreenBg!}.png`;
			}
			else if (qz)
			{
				imageUrl = `../uploads/quiz-game/${qz}/images/${this.gameService.signalGameConfig()!.imageMiniGameSplitScreenBg!}.png`;
			}
			
			if (imageUrl)
			{
				loadObjs.push({name: 'miniGameSplitScreenBgImage', url: imageUrl});
			}
			/*else
			{
				loadObjs.push({name: 'miniGameSplitScreenBgImage', url: 'assets/images/svg/ROY_white_full_coloured.svg'});
			}*/
		}
		/*else
		{
			loadObjs.push({name: 'miniGameSplitScreenBgImage', url: 'assets/images/svg/ROY_white_full_coloured.svg'});
		}*/
		
		return loadObjs;
	}
	
	private updateCompanyLogoImage(loadObjs: Array<{ name: SoundNameEnum | string, url: string }>): void
	{
		// company logo image
		// loadObjs.push({name: 'roy5050LogoImage', url: 'assets/images/roy-50-50-logo.png'});
		if (this.gameService.signalGameConfig() && this.gameService.signalGameConfig()!.imageCompanyLogo)
		{
			const qz: string | null = this.initService.qz;
			let imageUrl: string | null = null;
			
			if (this.gameService.signalGameConfig()!.isFtpReady)
			{
				imageUrl = `assets/images/${this.gameService.signalGameConfig()!.imageCompanyLogo!}.png`;
			}
			else if (qz)
			{
				imageUrl = `../uploads/quiz-game/${qz}/images/${this.gameService.signalGameConfig()!.imageCompanyLogo!}.png`;
			}
			
			if (imageUrl)
			{
				loadObjs.push({name: 'companyLogoImage', url: imageUrl});
			}
			else
			{
				loadObjs.push({name: 'companyLogoImage', url: 'assets/images/svg/ROY_white_full_coloured.svg'});
			}
		}
		else
		{
			loadObjs.push({name: 'companyLogoImage', url: 'assets/images/svg/ROY_white_full_coloured.svg'});
		}
	}
	
	private async loadFiles(loadObjs: Array<{ name: string, url: string }>): Promise<Array<{
		name: string,
		blob: Blob
	}>>
	{
		return await this.fileLoadService.downloadFilesWithProgress(
			loadObjs,
			(progressLoaded, progressTotal, progressPercentage) => {
				if (progressLoaded === progressTotal)
				{
					this.initService.signalLoadPercentage.set(100);
				}
				else
				{
					// console.log(progressLoaded, progressTotal, progressPercentage);
					if (progressPercentage > this.initService.signalLoadPercentage())
					{
						this.initService.signalLoadPercentage.set(progressPercentage);
					}
				}
			});
	}
	
	private initScorm()
	{
		this.scormService.init();
		
		const init = this.scormService.initLMS();
		console.log('Init LMS?', init);
		
		const lessonStatus = this.scormService.getValue('cmi.core.lesson_status');
		console.log('lessonStatus: ' + lessonStatus);
		
		// first time the lesson status needs to be set
		if (lessonStatus === 'not attempted')
		{
			this.scormService.setValue('cmi.core.lesson_status', 'incomplete');
			this.scormService.setValue('cmi.core.score.min', 0);
			this.scormService.setValue('cmi.core.score.max', 100);
			this.scormService.setValue('cmi.core.score.raw', 0);
		}
	}
	
	private initLocalization(): Promise<void>
	{
		NativeTranslateService.TRANSLATION_FILE_PATH = 'assets/i18n/';
		const locale = this.getBrowserLanguage(); // call init
		
		let additionalPath: Array<string> = [];
		if (this.gameService.signalGameConfig()?.isFtpReady)
		{
			// if game is ready for ftp, don't add additional path
			// because it is concatenated in the ZIP file
		}
		else if (this.initService.qz)
		{
			const qz: string = this.initService.qz;
			
			additionalPath = [
				`uploads/quiz-game/${qz}/i18n/{{locale}}.json`,
				`api/game/get-localizations.php?qz=${qz}&locale={{locale}}`
			];
		}
		else
		{
			additionalPath = ['uploads/quiz-game/base/i18n/{{locale}}.json'];
		}
		
		return this.nativeTranslateService.use(locale, additionalPath);
	}
	
	/*private playVideo(): void
	{
		this.videoService.showVideo('videoMain', this.videoElements.toArray());
	}*/
	
	private getBrowserLanguage(): LocaleEnum
	{
		let getLocale: string | undefined = (window.navigator as any).userLanguage || window.navigator.language;
		
		// check subdomain
		const host: string = window.location.host;
		const subdomain = host.split('.')[0];
		// let isSubDomainFound: boolean = false;
		
		const keys = Object.keys(LocaleEnum);
		
		for (let i = 0, n = keys.length; i < n; ++i)
		{
			if (keys.includes(subdomain))
			{
				//	isSubDomainFound = true;
				getLocale = keys[i];
				break;
			}
		}
		
		// check bot
		/*if (!isSubDomainFound && this.botService.isBot$.value)
		{
			getLanguage = LanguageEnum.en;
		}
		else*/
		/*if (!!getLanguage && getLanguage.indexOf('-') !== -1)
		{
			getLanguage = getLanguage.split('-')[0];
		}*/
		
		if (!getLocale)
		{
			getLocale = AppConfig.defaultLocale;
		}
		// else
		{
			/*		this.initService.send(getLocale).pipe(untilDestroyed(this)).subscribe(
						{
							next: () => {
							},
							error: () => {
							}
						}
					);*/
		}
		
		const queryParams: object | { locale: string } = UtilHttp.getQueryParams();
		
		if ('locale' in queryParams)
		{
			getLocale = queryParams.locale!.toString();
		}
		
		if (getLocale)
		{
			for (let i = 0, n = keys.length; i < n; ++i)
			{
				if (keys[i].includes(getLocale))
				{
					return keys[i] as LocaleEnum;
				}
			}
		}
		
		return AppConfig.defaultLocale;
	}
	
	private initGameTitleImage(): void
	{
		if (this.gameService.signalGameConfig())
		{
			if (this.gameService.signalGameConfig()!.imageGameTitle)
			{
				const qz: string | null = this.initService.qz;
				let imageUrl: string | null = null;
				
				if (this.gameService.signalGameConfig()!.isFtpReady)
				{
					imageUrl = `assets/images/${this.gameService.signalGameConfig()!.imageGameTitle}.png`;
				}
				else if (qz)
				{
					imageUrl = `../uploads/quiz-game/${qz}/images/${this.gameService.signalGameConfig()!.imageGameTitle}.png`;
				}
				
				if (imageUrl)
				{
					this.gameService.signalGameTitleImage.set(imageUrl);
				}
			}
		}
	}
	
	private initBackgroundImage(): void
	{
		// set a special background image
		if (this.gameService.signalGameConfig())
		{
			if (this.gameService.signalGameConfig()!.imageBg)
			{
				const qz: string | null = this.initService.qz;
				let imageUrl: string | null = null;
				
				if (this.gameService.signalGameConfig()!.isFtpReady)
				{
					imageUrl = `url('assets/images/${this.gameService.signalGameConfig()!.imageBg}.jpg')`;
				}
				else if (qz)
				{
					imageUrl = `url('../uploads/quiz-game/${qz}/images/${this.gameService.signalGameConfig()!.imageBg}.jpg')`;
				}
				
				if (imageUrl)
				{
					this.signalBackgroundImage.set(imageUrl);
				}
			}
		}
		else // base game bg image
		{
			this.signalBackgroundImage.set("url('../assets/images/ROY_Deepsea_Light.jpg')");
		}
	}
	
	private getSwipeYesNoSwipeImagePath(swipeYesNoPath: string): string | null
	{
		// set a special background image
		if (this.gameService.signalGameConfig())
		{
			if (this.gameService.signalGameConfig()!.screenQuiz.imageSwipe)
			{
				const qz: string | null = this.initService.qz;
				const image: string | null = this.gameService.signalGameConfig()!.screenQuiz.imageSwipe;
				
				if (this.gameService.signalGameConfig()!.isFtpReady)
				{
					return `assets/images/${image}.png`;
				}
				else if (qz)
				{
					return `../uploads/quiz-game/${qz}/images/${image}.png`;
				}
				
				// return null; // <-- only when needed
			}
		}
		
		return swipeYesNoPath + 'images/swipe-left-right.png'; // base game bg image
	}
	
	private getSwipeYesNoGreatImagePath(swipeYesNoPath: string): string | null
	{
		// set a special background image
		if (this.gameService.signalGameConfig())
		{
			if (this.gameService.signalGameConfig()!.screenQuiz.imageGreat)
			{
				const qz: string | null = this.initService.qz;
				const image: string | null = this.gameService.signalGameConfig()!.screenQuiz.imageGreat;
				
				if (this.gameService.signalGameConfig()!.isFtpReady)
				{
					return `assets/images/${image}.png`;
				}
				else if (qz)
				{
					return `../uploads/quiz-game/${qz}/images/${image}.png`;
				}
				
				// return null; // <-- only when needed
			}
		}
		
		return swipeYesNoPath + 'images/great.png'; // base game bg image
	}
	
	private initSwipeYesNoGameBaseSettings(): void
	{
		if (this.gameService.signalGameConfig())
		{
			this.swipeYesNoService.isStandardBaseGame = false;
			this.swipeYesNoService.updateGlobalSettingsFromGameConfig(this.gameService.signalGameConfig()!.screenQuiz);
			
			this.swipeYesNoService.updateGoldenCardImage(
				this.gameService.signalGameConfig()!.screenQuiz.questionCardGold.colorBg,
				this.gameService.signalGameConfig()!.screenQuiz.questionCardGold.colorBg2,
				this.gameService.signalGameConfig()!.screenQuiz.questionCardGold.colorBg3,
				this.gameService.signalGameConfig()!.screenQuiz.questionCardGold.colorBg4,
				this.gameService.signalGameConfig()!.screenQuiz.questionCardGold.colorBg5
			);
			// time bar colors
			this.swipeYesNoService.timeBarColors[0] = this.gameService.signalGameConfig()!.screenQuiz.timeBar.colorBg2;
			this.swipeYesNoService.timeBarColors[1] = this.gameService.signalGameConfig()!.screenQuiz.timeBar.colorBg3;
			this.swipeYesNoService.timeBarColors[2] = this.gameService.signalGameConfig()!.screenQuiz.timeBar.colorBg4;
			this.swipeYesNoService.timeBarColors[3] = this.gameService.signalGameConfig()!.screenQuiz.timeBar.colorBg5;
		}
		else
		{
			this.swipeYesNoService.isStandardBaseGame = true;
		}
	}
	
	private initIFrameSubscription(): void
	{
		if (this.gameService.signalGameConfig()?.isFtpReady)
		{
			return;
		}
		
		this.iFrameEventRuleService.init(
			this.signalBackgroundImage,
			this.gameHeaderComponent,
			this.changeDetectorRef
		);
	}
}
