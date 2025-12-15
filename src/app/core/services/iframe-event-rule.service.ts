import {ChangeDetectorRef, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {IframeEventService} from './iframe-event.service';
import {Subscription} from 'rxjs';
import {AppRoutesEnum} from '../../app-routes.enum';
import {UtilObj} from '../../shared/utils/util-obj';
import {
	AniSplitScreenTitleService
} from '../../shared/components/ani-split-screen-title/ani-split-screen-title.service';
import {NativeTranslateService} from './native-translate.service';
import {InitService} from './init.service';
import {Router} from '@angular/router';
import {FontStyleService} from './font-style.service';
import {GameService} from './game.service';
import {BackgroundGradientService} from './background-gradient.service';
import {UtilBlob} from '../../shared/utils/util-blob';
import {GameCoinsService} from './game-coins.service';
import {ImageLoadService} from './image-load.service';
import {BackgroundAnimationService} from './background-animation.service';
import {GameHeaderComponent} from '../components/game-header/game-header.component';
import {FileLoadService} from './file-load.service';
import {SwipeYesNoService} from '../../games/swipe-yes-no/services/swipe-yes-no.service';
import {ConfigButtonModel} from '../../shared/models/config/config-button.model';
import {QuizGameScreenHighscoreModel} from '../../shared/models/config/quiz-game-screen-highscore.model';
import {ConfigContainerModel} from '../../shared/models/config/config-container.model';
import {QuizGameScreenQuizModel} from '../../shared/models/config/quiz-game-screen-quiz.model';
import {QuizGameScreenMinigamesModel} from '../../shared/models/config/quiz-game-screen-minigames.model';
import {QuizGameScreenEndGameModel} from '../../shared/models/config/quiz-game-screen-end-game.model';
import {QuizGameScreenMgPachinkoModel} from '../../shared/models/config/quiz-game-screen-mg-pachinko.model';
import {QuizGameScreenMgRouletteModel} from '../../shared/models/config/quiz-game-screen-mg-roulette.model';
import {QuizGameScreenMgPointShooterModel} from '../../shared/models/config/quiz-game-screen-mg-point-shooter.model';

@Injectable({
	providedIn: 'root'
})
export class IframeEventRuleService
{
	private iFrameEventService = inject(IframeEventService);
	
	protected initService = inject(InitService);
	protected gameService = inject(GameService);
	private gameCoinsService = inject(GameCoinsService);
	protected fontStyleService = inject(FontStyleService);
	protected backgroundGradientService = inject(BackgroundGradientService);
	protected backgroundAnimationService = inject(BackgroundAnimationService);
	private aniSplitScreenTitleService = inject(AniSplitScreenTitleService);
	protected swipeYesNoService = inject(SwipeYesNoService);
	private nativeTranslateService = inject(NativeTranslateService);
	private imageLoadService = inject(ImageLoadService);
	private fileLoadService = inject(FileLoadService);
	private router = inject(Router);
	
	private iFrameSubscription: Subscription | null = null;
	
	public readonly signalIsActivated = signal<boolean>(false);
	protected signalBackgroundImage?: WritableSignal<string | null>;
	protected gameHeaderComponent?: GameHeaderComponent;
	protected changeDetectorRef?: ChangeDetectorRef;
	
	public init(
		signalBackgroundImage: WritableSignal<string | null>,
		gameHeaderComponent: GameHeaderComponent,
		changeDetectorRef: ChangeDetectorRef
	): void
	{
		this.signalBackgroundImage = signalBackgroundImage;
		this.gameHeaderComponent = gameHeaderComponent;
		this.changeDetectorRef = changeDetectorRef;
		
		this.iFrameEventService.init();
		
		this.iFrameSubscription = this.iFrameEventService.onUpdate.subscribe(this.onUpdate.bind(this));
	}
	
	public destroy(): void
	{
		if (this.iFrameSubscription)
		{
			this.iFrameSubscription.unsubscribe();
			this.iFrameSubscription = null;
		}
		
		this.iFrameEventService.destroy();
	}
	
	private restartSplitScreenTitleAnimation(): void
	{
		// this.changeDetectorRef.detectChanges();
		window.dispatchEvent(new Event('resize')); // calls game category page resize
		
		this.aniSplitScreenTitleService.restart();
		
		const url: string = this.router.url.split('?')[0];
		if (url !== '/' + AppRoutesEnum.game)
		{
			this.initService.navigateToRoute(AppRoutesEnum.game).then();
		}
	}
	
	private restartMiniGameSplitScreenTitleAnimation(): void
	{
		// this.changeDetectorRef.detectChanges();
		window.dispatchEvent(new Event('resize')); // calls game category page resize
		
		this.aniSplitScreenTitleService.restart();
		
		const url: string = this.router.url.split('?')[0];
		if (url !== '/' + AppRoutesEnum.gameMultiplier)
		{
			this.initService.navigateToRoute(AppRoutesEnum.gameMultiplier).then();
		}
	}
	
	private updateValueInConfig<T extends object>(
		event: any,
		objectModel: T,
		route?: string,
		callbackChangeBaseModel?: () => void,
		callbackChangeSubModel?: () => void
	): void
	{
		if (route)
		{
			const url: string = this.router.url.split('?')[0];
			if (url !== '/' + route)
			{
				this.initService.navigateToRoute(route).then();
			}
		}
		
		// check if the button config has the class attribute by formModelName
		if (event.data.formModelName in objectModel)
		{
			// we have the object reference to the config button in game config and can update it directly
			(objectModel as any)[event.data.formModelName] = event.data.value;
			
			window.dispatchEvent(new Event('resize')); // calls button update
		}
		
		if (callbackChangeBaseModel)
		{
			callbackChangeBaseModel();
		}
		if (callbackChangeSubModel)
		{
			callbackChangeSubModel();
		}
	}
	
	private updateValuesInScreenModel<T extends object>(
		event: any,
		objectModel: T,
		route?: string,
		callbackChangeBaseModel?: () => void,
		callbackChangeSubModel?: () => void
	): void
	{
		// check if a submodel should be changed in the model
		if (event.data.subId)
		{
			// get config class attribute by id
			const config2 = (objectModel as any)[event.data.subId!];
			
			if (config2 instanceof ConfigContainerModel)
			{
				this.updateValueInConfig<ConfigContainerModel>(event, config2 as ConfigContainerModel, route, undefined, callbackChangeSubModel);
			}
			else if (config2 instanceof ConfigButtonModel)
			{
				this.updateValueInConfig<ConfigButtonModel>(event, config2 as ConfigButtonModel, route, undefined, callbackChangeSubModel);
			}
		}
		else
		{
			this.updateValueInConfig<typeof objectModel>(event, objectModel, route, callbackChangeBaseModel, undefined);
		}
	}
	
	private onUpdate(event: any): void
	{
		if (event.data?.formModelName)
		{
			this.signalIsActivated.set(true);
		}
		
		if ( // check the event has an ID special config
			'id' in event.data &&
			'formModelName' in event.data &&
			'value' in event.data
		)
		{
			const gameConfig = this.gameService.signalGameConfig();
			if (!gameConfig)
			{
				return;
			}
			
			const id: string = event.data.id!;
			
			// values for base game config object directly
			if (id === '')
			{
				this.updateValueInConfig(event, gameConfig, event.data.route);
				
				return;
			}
			
			// get config class attribute by id
			const config = (gameConfig as any)[id];
			
			// values for highscore screen
			if (config instanceof QuizGameScreenHighscoreModel)
			{
				const configModel = config as QuizGameScreenHighscoreModel;
				event.data.route = AppRoutesEnum.highScore;
				
				this.updateValuesInScreenModel(event, configModel, event.data.route, undefined, undefined);
			}
			if (config instanceof QuizGameScreenQuizModel)
			{
				const configModel = config as QuizGameScreenQuizModel;
				event.data.route = AppRoutesEnum.game;
				
				this.updateValuesInScreenModel(event, configModel, event.data.route,
					() => { // changed the base model
						this.swipeYesNoService.signalIsEditorCallGoldenCard.set(false);
						this.swipeYesNoService.updateGlobalSettingsFromGameConfig(gameConfig.screenQuiz);
						this.swipeYesNoService.updateStyles();
						
						if (event.data.formModelName === 'imageSwipe')
						{
							const imageKey: string = 'swipeYesNoSwipeLeftRightImage';
							const base64Image: string | null = event.data.value ?? null;
							if (base64Image && base64Image.indexOf('data:image/') !== -1 && base64Image.indexOf(';base64') !== -1)
							{
								this.imageLoadService.addImage(imageKey, event.data.value);
							}
							else
							{
								this.imageLoadService.removeImage(imageKey);
								const swipeYesNoPath: string = 'assets/games/swipe-yes-no/';
								this.loadFiles([{
									name: imageKey,
									url: swipeYesNoPath + 'images/swipe-left-right.png'
								}])
									.then((files: Array<{ name: string, blob: Blob }>): void => {
											for (const file of files)
											{
												if (file.blob.type === 'image/jpeg' || file.blob.type === 'image/png' || file.blob.type === 'image/svg+xml')
												{
													this.imageLoadService.addImage(file.name, file.blob);
													this.swipeYesNoService.triggerRerender();
												}
											}
										}
									);
							}
							
							this.swipeYesNoService.triggerRerender();
						}
						else if (event.data.formModelName === 'imageGreat')
						{
							const imageKey: string = 'swipeYesNoGreatImage';
							const base64Image: string | null = event.data.value ?? null;
							
							if (base64Image && base64Image.indexOf('data:image/') !== -1 && base64Image.indexOf(';base64') !== -1)
							{
								this.imageLoadService.addImage(imageKey, event.data.value);
							}
							else
							{
								this.imageLoadService.removeImage(imageKey);
								const swipeYesNoPath: string = 'assets/games/swipe-yes-no/';
								this.loadFiles([{
									name: imageKey,
									url: swipeYesNoPath + 'images/great.png'
								}])
									.then((files: Array<{ name: string, blob: Blob }>): void => {
											for (const file of files)
											{
												if (file.blob.type === 'image/jpeg' || file.blob.type === 'image/png' || file.blob.type === 'image/svg+xml')
												{
													this.imageLoadService.addImage(file.name, file.blob);
													this.swipeYesNoService.triggerRerender('correct');
												}
											}
										}
									);
							}
							
							this.swipeYesNoService.triggerRerender('correct');
						}
						else if (event.data.formModelName === 'fontColorFeedback')
						{
							this.swipeYesNoService.triggerRerender('correct');
						}
					},
					() => { // changed the submodel
						this.swipeYesNoService.signalIsEditorCallGoldenCard.set(event.data.subId === 'questionCardGold');
						this.swipeYesNoService.triggerRerender();
						
						if (event.data.subId === 'questionCardGold')
						{
							this.swipeYesNoService.updateGoldenCardImage(
								this.gameService.signalGameConfig()!.screenQuiz.questionCardGold.colorBg,
								this.gameService.signalGameConfig()!.screenQuiz.questionCardGold.colorBg2,
								this.gameService.signalGameConfig()!.screenQuiz.questionCardGold.colorBg3,
								this.gameService.signalGameConfig()!.screenQuiz.questionCardGold.colorBg4,
								this.gameService.signalGameConfig()!.screenQuiz.questionCardGold.colorBg5
							);
						}
						else if (event.data.subId === 'timeBar')
						{
							this.swipeYesNoService.timeBarColors[0] = this.gameService.signalGameConfig()!.screenQuiz.timeBar.colorBg2;
							this.swipeYesNoService.timeBarColors[1] = this.gameService.signalGameConfig()!.screenQuiz.timeBar.colorBg3;
							this.swipeYesNoService.timeBarColors[2] = this.gameService.signalGameConfig()!.screenQuiz.timeBar.colorBg4;
							this.swipeYesNoService.timeBarColors[3] = this.gameService.signalGameConfig()!.screenQuiz.timeBar.colorBg5;
							this.swipeYesNoService.signalRemainingTimeRank.set(0);
						}
						else if (event.data.subId === 'btnFeedback')
						{
							this.swipeYesNoService.triggerRerender('correct');
						}
					});
			}
			else if (config instanceof QuizGameScreenMinigamesModel)
			{
				const configModel = config as QuizGameScreenQuizModel;
				event.data.route = AppRoutesEnum.gameMultiplier;
				
				this.updateValuesInScreenModel(event, configModel, event.data.route,
					() => { // changed the base model
					
					},
					() => { // changed the submodel
					
					});
			}
			else if (config instanceof QuizGameScreenMgPachinkoModel)
			{
				const configModel = config as QuizGameScreenMgPachinkoModel;
				event.data.route = AppRoutesEnum.gameMultiplier;
				
				const mGame: number = 1;
				if (this.gameService.signalCurrentMultiplierGame() !== mGame)
				{
					this.gameService.signalCurrentMultiplierGame.set(mGame);
					this.aniSplitScreenTitleService.restart();
				}
				
				this.updateValuesInScreenModel(event, configModel, event.data.route,
					() => { // changed the base model
					
					},
					() => { // changed the submodel
					
					});
			}
			else if (config instanceof QuizGameScreenMgRouletteModel)
			{
				const configModel = config as QuizGameScreenMgRouletteModel;
				event.data.route = AppRoutesEnum.gameMultiplier;
				
				const mGame: number = 2;
				if (this.gameService.signalCurrentMultiplierGame() !== mGame)
				{
					this.gameService.signalCurrentMultiplierGame.set(mGame);
					this.aniSplitScreenTitleService.restart();
				}
				
				this.updateValuesInScreenModel(event, configModel, event.data.route,
					() => { // changed the base model
					
					},
					() => { // changed the submodel
					
					});
			}
			else if (config instanceof QuizGameScreenMgPointShooterModel)
			{
				const configModel = config as QuizGameScreenMgPointShooterModel;
				event.data.route = AppRoutesEnum.gameMultiplier;
				
				const mGame: number = 3;
				if (this.gameService.signalCurrentMultiplierGame() !== mGame)
				{
					this.gameService.signalCurrentMultiplierGame.set(mGame);
					this.aniSplitScreenTitleService.restart();
				}
				
				this.updateValuesInScreenModel(event, configModel, event.data.route,
					() => { // changed the base model
					
					},
					() => { // changed the submodel
					
					});
			}
			else if (config instanceof QuizGameScreenEndGameModel)
			{
				const configModel = config as QuizGameScreenEndGameModel;
				event.data.route = AppRoutesEnum.endGame;
				
				this.updateValuesInScreenModel(event, configModel, event.data.route,
					() => { // changed the base model
					
					},
					() => { // changed the submodel
					
					});
			}
			// check if the config is a container config
			else if (config instanceof ConfigContainerModel)
			{
				this.updateValueInConfig<ConfigContainerModel>(event, config as ConfigContainerModel, event.data.route);
			}
			// check if the config is a button config
			else if (config instanceof ConfigButtonModel)
			{
				this.updateValueInConfig<ConfigButtonModel>(event, config as ConfigButtonModel, event.data.route);
			}
		}
		else if (event.data?.formModelName && UtilObj.isset(event.data?.value))
		{
			const locale: string = event.data?.formModelName?.slice(-5);
			const locaKey: string = event.data?.formModelName?.slice(0, -6);
			if (locale === this.nativeTranslateService.signalCurrentLocale())
			{
				this.nativeTranslateService.overwriteLocalTranslationValue(locale, locaKey, event.data.value);
				
				if (locaKey === 'quiz-name')
				{
					const url: string = this.router.url.split('?')[0];
					if (url !== '/' + AppRoutesEnum.base)
					{
						this.initService.navigateToRoute(AppRoutesEnum.base).then();
					}
				}
				
				// this.changeDetectorRef.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
			else if (event.data.formModelName === 'mainFont')
			{
				if (event.data.value.length > 0)
				{
					this.fontStyleService.applyFont(
						'MainFont',
						'uploads/' + event.data.value,
						true
					);
				}
				else
				{
					this.fontStyleService.removeFont('MainFont');
				}
			}
		}
		else if (event.data.formModelName === 'titleAlignment' && 'alignment' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.titleAlignment = event.data.alignment;
				
				const url: string = this.router.url.split('?')[0];
				if (url !== '/' + AppRoutesEnum.base)
				{
					this.initService.navigateToRoute(AppRoutesEnum.base).then();
				}
				
				// hack for updating the title image
				if (this.gameService.signalGameTitleImage())
				{
					const image = this.gameService.signalGameTitleImage();
					this.gameService.signalGameTitleImage.set(null);
					this.gameService.signalGameTitleImage.set(image);
				}
				
				this.changeDetectorRef?.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
		}
		else if (event.data.formModelName === 'titleFontSize' && 'fontSize' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.titleFontSize = Math.round(event.data.fontSize);
				
				const url: string = this.router.url.split('?')[0];
				if (url !== '/' + AppRoutesEnum.base)
				{
					this.initService.navigateToRoute(AppRoutesEnum.base).then();
				}
				
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
		}
		else if (event.data.formModelName === 'titleLineHeight' && 'height' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.titleLineHeight = parseFloat(event.data.height);
				
				const url: string = this.router.url.split('?')[0];
				if (url !== '/' + AppRoutesEnum.base)
				{
					this.initService.navigateToRoute(AppRoutesEnum.base).then();
				}
				
				// this.changeDetectorRef.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
		}
		else if (event.data.formModelName === 'activeMiniGames' && 'activeMiniGames' in event.data)
		{
			const gameConfig = this.gameService.signalGameConfig();
			
			if (gameConfig)
			{
				const currentActiveMiniGames: Array<number> = this.gameService.signalGameConfig()!.activeMiniGames ?? [];
				const newGame: number | undefined = findAddedNumber(
					currentActiveMiniGames,
					event.data.activeMiniGames
				);
				
				gameConfig.activeMiniGames = event.data.activeMiniGames;
				
				if (
					event.data.isEnabled &&
					newGame !== undefined &&
					this.gameService.signalCurrentMultiplierGame() !== newGame
				)
				{
					this.gameService.signalCurrentMultiplierGame.set(newGame);
					this.aniSplitScreenTitleService.restart();
					
					this.initService.navigateToRoute(AppRoutesEnum.gameMultiplier).then();
				}
				
				function findAddedNumber(original: number[], updated: number[]): number | undefined
				{
					const originalSet = new Set(original);
					for (const num of updated)
					{
						if (!originalSet.has(num))
						{
							return num;
						}
					}
					return undefined;
				}
			}
		}
		else if (event.data.formModelName === 'maxQuizQuestionCount' && 'count' in event.data)
		{
			const count: number = event.data.count;
			
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.maxQuizQuestionCount = count;
				this.gameService.init();
				this.initService.navigateToRoute(AppRoutesEnum.game).then();
			}
		}
		else if (event.data.formModelName === 'fontColorTitle' && 'color' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.fontColorTitle = event.data.color;
				
				const url: string = this.router.url.split('?')[0];
				if (url !== '/' + AppRoutesEnum.base)
				{
					this.initService.navigateToRoute(AppRoutesEnum.base).then();
				}
				
				// this.changeDetectorRef.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
		}
		else if (event.data.formModelName === 'fontColorMain' && 'color' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.fontColorMain = event.data.color;
				
				/*const url: string = this.router.url.split('?')[0];
				if (url !== '/' + AppRoutesEnum.base)
				{
					this.initService.navigateToRoute(AppRoutesEnum.base).then();
				}*/
				
				// this.changeDetectorRef.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
		}
		else if (event.data.formModelName === 'fontColorLink' && 'color' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.fontColorLink = event.data.color;
				
				/*const url: string = this.router.url.split('?')[0];
				if (url !== '/' + AppRoutesEnum.base)
				{
					this.initService.navigateToRoute(AppRoutesEnum.base).then();
				}*/
				
				// this.changeDetectorRef.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
		}
		else if (event.data.formModelName === 'dialogColorBg' && 'color' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.dialogColorBg = event.data.color;
				
				/*const url: string = this.router.url.split('?')[0];
				if (url !== '/' + AppRoutesEnum.base)
				{
					this.initService.navigateToRoute(AppRoutesEnum.base).then();
				}*/
				
				// this.changeDetectorRef.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
		}
		else if (event.data.formModelName === 'fontColorDialog' && 'color' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.fontColorDialog = event.data.color;
				
				/*const url: string = this.router.url.split('?')[0];
				if (url !== '/' + AppRoutesEnum.base)
				{
					this.initService.navigateToRoute(AppRoutesEnum.base).then();
				}*/
				
				// this.changeDetectorRef.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
		}
		else if (event.data.formModelName === 'dialogRadius' && 'radius' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.dialogRadius = event.data.radius;
				
				/*const url: string = this.router.url.split('?')[0];
				if (url !== '/' + AppRoutesEnum.base)
				{
					this.initService.navigateToRoute(AppRoutesEnum.base).then();
				}*/
				
				// this.changeDetectorRef.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
		}
		else if (event.data.formModelName === 'dialogBorder' && 'thickness' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.dialogBorder = event.data.thickness;
				
				/*const url: string = this.router.url.split('?')[0];
				if (url !== '/' + AppRoutesEnum.base)
				{
					this.initService.navigateToRoute(AppRoutesEnum.base).then();
				}*/
				
				// this.changeDetectorRef.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
		}
		else if (event.data.formModelName === 'dialogBorderColor' && 'color' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.dialogBorderColor = event.data.color;
				
				/*const url: string = this.router.url.split('?')[0];
				if (url !== '/' + AppRoutesEnum.base)
				{
					this.initService.navigateToRoute(AppRoutesEnum.base).then();
				}*/
				
				// this.changeDetectorRef.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
		}
		else if (event.data.formModelName === 'fontColorButton' && 'color' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.fontColorButton = event.data.color;
				this.gameService.signalGameConfig()!.defaultBtn.fontColor = event.data.color;
				// this.changeDetectorRef.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
		}
		else if (event.data.formModelName === 'colorButtonBg' && 'color' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.colorButtonBg = event.data.color;
				this.gameService.signalGameConfig()!.defaultBtn.colorBg = event.data.color;
				// this.changeDetectorRef.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
		}
		else if (event.data.formModelName === 'buttonRadius' && 'radius' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.buttonRadius = event.data.radius;
				this.gameService.signalGameConfig()!.defaultBtn.radius = event.data.radius;
				// this.changeDetectorRef.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
		}
		else if (event.data.formModelName === 'buttonBorder' && 'thickness' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.buttonBorder = event.data.thickness;
				this.gameService.signalGameConfig()!.defaultBtn.border = event.data.thickness;
				// this.changeDetectorRef.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
		}
		else if (event.data.formModelName === 'buttonBorderColor' && 'color' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.buttonBorderColor = event.data.color;
				this.gameService.signalGameConfig()!.defaultBtn.borderColor = event.data.color;
				// this.changeDetectorRef.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
		}
		else if (event.data.formModelName === 'fontColorIconButton' && 'color' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.fontColorIconButton = event.data.color;
				// this.changeDetectorRef.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
		}
		else if (event.data.formModelName === 'colorIconButtonBg' && 'color' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.colorIconButtonBg = event.data.color;
				// this.changeDetectorRef.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
		}
		else if (event.data.formModelName === 'iconButtonRadius' && 'radius' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.iconButtonRadius = event.data.radius;
				// this.changeDetectorRef.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
		}
		else if (event.data.formModelName === 'iconButtonBorder' && 'thickness' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.iconButtonBorder = event.data.thickness;
				// this.changeDetectorRef.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
		}
		else if (event.data.formModelName === 'iconButtonBorderColor' && 'color' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.iconButtonBorderColor = event.data.color;
				// this.changeDetectorRef.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
			}
		}
		else if (event.data.formModelName === 'colorCategoryPath' && 'color' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.colorCategoryPath = event.data.color;
				
				const url: string = this.router.url.split('?')[0];
				if (url !== '/' + AppRoutesEnum.gameTopic)
				{
					this.initService.navigateToRoute(AppRoutesEnum.gameTopic).then();
				}
				
				// this.changeDetectorRef.detectChanges();
				window.dispatchEvent(new Event('resize')); // calls game category page resize
			}
		}
		else if (event.data.formModelName === 'backgroundColors' && Array.isArray(event.data.colors))
		{
			this.backgroundGradientService.init(event.data.colors, this.gameService.signalGameConfig()?.backgroundColorsDuration ?? 25);
		}
		else if (event.data.formModelName === 'imageGameTitle' && 'base64Image' in event.data)
		{
			const base64Image: string | null = event.data?.base64Image ?? null;
			// const imageUrl: string = base64Image ? `url('${base64Image}')` : 'none';
			
			this.gameService.signalGameTitleImage.set(base64Image);
		}
		else if (event.data.formModelName === 'imageBg' && 'base64Image' in event.data)
		{
			const base64Image: string | null = event.data?.base64Image ?? null;
			const imageUrl: string = base64Image ? `url('${base64Image}')` : 'none';
			
			this.signalBackgroundImage?.set(imageUrl);
		}
		else if (event.data.formModelName === 'imageScoreAni' && 'base64Image' in event.data)
		{
			const base64Image: string | null = event.data?.base64Image ?? null;
			// const imageUrl: string = base64Image ? `url('${base64Image}')` : 'none';
			
			if (base64Image)
			{
				if (base64Image.indexOf('data:image/') !== -1 && base64Image.indexOf(';base64') !== -1)
				{
					const blob = UtilBlob.getBlobFromBase64String(base64Image);
					
					if (blob)
					{
						this.imageLoadService.addImage('crabFrontImage', blob);
						this.imageLoadService.addImage('crabBackImage', blob);
					}
				}
				
				const targetX: number = 784;
				const targetY: number = 54;
				this.gameCoinsService.init(event.data?.isRotatingFlyingAni ?? false);
				this.gameHeaderComponent?.init();
				
				this.changeDetectorRef?.detectChanges();
				
				this.gameCoinsService.start(1080 * 0.5, 1000, targetX, targetY, 4, null, null);
			}
		}
		else if (event.data.formModelName === 'backgroundColorsDuration' && 'duration' in event.data)
		{
			this.gameService.signalGameConfig()!.backgroundColorsDuration = event.data.duration;
			this.backgroundGradientService.signalBackgroundColorsDuration.set(event.data.duration);
		}
		else if (event.data.formModelName === 'imageBackgroundAnimation' && 'type' in event.data)
		{
			//console.log(event.data)
			const type: 'add' | 'remove' | 'update' = event.data.type;
			
			if (type === 'add')
			{
				this.backgroundAnimationService.addImage(event.data.fileName, event.data.base64Image);
			}
			else if (type === 'remove')
			{
				this.backgroundAnimationService.removeImage(event.data.oldFileName);
			}
			else if (type === 'update')
			{
				this.backgroundAnimationService.removeImage(event.data.oldFileName);
				this.backgroundAnimationService.addImage(event.data.fileName, event.data.base64Image);
			}
			
			// TODO problem with adding a picture and change route to highscore -> this is resetting the icons
			// TODO duplicate keys in HTML if url repeats
			if (this.gameService.signalGameConfig()?.backgroundAnimationImageUrls)
			{
				const urls: Array<string> = [];
				for (const imageUrl of this.backgroundAnimationService.signalImageUrls())
				{
					urls.push(imageUrl.url);
				}
				
				this.gameService.signalGameConfig()!.backgroundAnimationImageUrls = urls;
			}
		}
		else if (event.data.formModelName === 'backgroundAnimationType' && 'type' in event.data)
		{
			this.gameService.signalGameConfig()!.backgroundAnimationType = event.data.type;
			
			if (this.gameService.signalGameConfig()?.backgroundAnimationImageUrls)
			{
				this.backgroundAnimationService.setImageUrls(
					this.gameService.signalGameConfig()!.backgroundAnimationImageUrls ?? [],
					this.gameService.signalGameConfig()!.backgroundAnimationType
				);
			}
			
			const url: string = this.router.url.split('?')[0];
			if (url !== '/' + AppRoutesEnum.base)
			{
				this.initService.navigateToRoute(AppRoutesEnum.base).then();
			}
			
			// this.changeDetectorRef.detectChanges();
			window.dispatchEvent(new Event('resize')); // calls appAutoFitFont
		}
		else if (event.data.formModelName === 'splitScreenAnimationType' && 'type' in event.data)
		{
			this.gameService.signalGameConfig()!.splitScreenAnimationType = event.data.type;
			
			this.restartSplitScreenTitleAnimation();
		}
		else if (event.data.formModelName === 'splitScreenColorBg' && 'color' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.splitScreenColorBg = event.data.color;
				
				this.restartSplitScreenTitleAnimation();
			}
		}
		else if (event.data.formModelName === 'imageSplitScreenBg' && 'base64Image' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				const base64Image: string | null = event.data?.base64Image ?? null;
				
				if (base64Image)
				{
					if (base64Image.indexOf('data:image/') !== -1 && base64Image.indexOf(';base64') !== -1)
					{
						const blob = UtilBlob.getBlobFromBase64String(base64Image);
						
						if (blob)
						{
							this.imageLoadService.addImage('splitScreenBgImage', blob);
							this.restartSplitScreenTitleAnimation();
						}
					}
				}
				else
				{
					this.imageLoadService.removeImage('splitScreenBgImage');
					this.restartSplitScreenTitleAnimation();
				}
			}
		}
		else if (event.data.formModelName === 'miniGameSplitScreenAnimationType' && 'type' in event.data)
		{
			this.gameService.signalGameConfig()!.miniGameSplitScreenAnimationType = event.data.type;
			
			this.restartMiniGameSplitScreenTitleAnimation();
		}
		else if (event.data.formModelName === 'miniGameSplitScreenColorBg' && 'color' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.miniGameSplitScreenColorBg = event.data.color;
				
				this.restartMiniGameSplitScreenTitleAnimation();
			}
		}
		else if (event.data.formModelName === 'imageMiniGameSplitScreenBg' && 'base64Image' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				const base64Image: string | null = event.data?.base64Image ?? null;
				
				if (base64Image)
				{
					if (base64Image.indexOf('data:image/') !== -1 && base64Image.indexOf(';base64') !== -1)
					{
						const blob = UtilBlob.getBlobFromBase64String(base64Image);
						
						if (blob)
						{
							this.imageLoadService.addImage('miniGameSplitScreenBgImage', blob);
							this.restartMiniGameSplitScreenTitleAnimation();
						}
					}
				}
				else
				{
					this.imageLoadService.removeImage('miniGameSplitScreenBgImage');
					this.restartMiniGameSplitScreenTitleAnimation();
				}
			}
		}
		else if (event.data.formModelName === 'imageCompanyLogo' && 'base64Image' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				const base64Image: string | null = event.data?.base64Image ?? null;
				
				if (base64Image)
				{
					if (base64Image.indexOf('data:image/') !== -1 && base64Image.indexOf(';base64') !== -1)
					{
						const blob = UtilBlob.getBlobFromBase64String(base64Image);
						
						if (blob)
						{
							this.imageLoadService.addImage('companyLogoImage', blob);
							this.gameService.signalGameConfig()!.imageCompanyLogo = 'company-logo';
							window.dispatchEvent(new Event('resize')); // calls base page resize
						}
					}
				}
				else
				{
					// replace it with the default logo and url
					this.gameService.signalGameConfig()!.urlCompany = null;
					this.gameService.signalGameConfig()!.imageCompanyLogo = null;
					
					this.loadFiles([{name: 'companyLogoImage', url: 'assets/images/svg/ROY_white_full_coloured.svg'}])
						.then((files: Array<{ name: string, blob: Blob }>): void => {
								
								for (const file of files)
								{
									if (file.blob.type === 'image/jpeg' || file.blob.type === 'image/png' || file.blob.type === 'image/svg+xml')
									{
										this.imageLoadService.addImage(file.name, file.blob);
									}
								}
							}
						);
					
					window.dispatchEvent(new Event('resize')); // calls base page resize
				}
			}
		}
		else if (event.data.formModelName === 'urlCompany' && 'url' in event.data)
		{
			if (this.gameService.signalGameConfig())
			{
				this.gameService.signalGameConfig()!.urlCompany = event.data.url;
			}
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
				if (progressLoaded === progressTotal && progressPercentage)
				{
					//	this.initService.signalLoadPercentage.set(100);
				}
				else
				{
					/*	// console.log(progressLoaded, progressTotal, progressPercentage);
						if (progressPercentage > this.initService.signalLoadPercentage())
						{
							this.initService.signalLoadPercentage.set(progressPercentage);
						}*/
				}
			});
	}
}
