import {AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild} from '@angular/core';
import {InitService} from '../../core/services/init.service';
import {SwipeYesNoService} from '../../games/swipe-yes-no/services/swipe-yes-no.service';
import {UtilTimeout} from '../../shared/utils/util-timeout';
import {GameScoreService} from '../../core/services/game-score.service';
import {UserGameService} from '../../core/services/user-game.service';
import {NicknameFormModel} from '../../shared/models/nickname-form.model';
import {AppRoutesEnum} from '../../app-routes.enum';
import gsap from 'gsap';
import {SoundNameEnum} from '../../shared/enums/sound-name.enum';
import {SoundService} from '../../core/services/sound.service';
import {GameScoreBackendService} from '../../core/services/game-score-backend.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {Subscription} from 'rxjs';
import {ImageLoadService} from '../../core/services/image-load.service';
import {NicknameFormComponent} from '../../core/components/nickname-form/nickname-form.component';
import {GameService} from '../../core/services/game.service';
import {ButtonSoundOnOffComponent} from '../../shared/components/button-sound-on-off/button-sound-on-off.component';
import {ButtonFullscreenComponent} from '../../shared/components/button-fullscreen/button-fullscreen.component';
import {ToastService} from '../../shared/modules/toast/toast.service';
import {ToastTypeEnum} from '../../shared/modules/toast/toast-type-enum';
import {StopTypeEnum} from '../../games/enums/stop-type.enum';
import {NativeTranslateService} from '../../core/services/native-translate.service';
import {AppConfig} from '../../app.config';
import {ConfettiComponent} from '../../shared/components/confetti/confetti.component';

@UntilDestroy()
@Component({
	selector: 'app-end-game-page',
	templateUrl: './end-game-page.component.html',
	styleUrl: './end-game-page.component.scss',
	standalone: false
})
export class EndGamePageComponent implements OnInit, AfterViewInit, OnDestroy
{
	protected initService = inject(InitService);
	protected swipeYesNoService = inject(SwipeYesNoService);
	protected gameService = inject(GameService);
	protected gameScoreService = inject(GameScoreService);
	protected gameScoreBackendService = inject(GameScoreBackendService);
	protected userGameService = inject(UserGameService);
	protected soundService = inject(SoundService);
	private toastService = inject(ToastService);
	private imageLoadService = inject(ImageLoadService);
	private nativeTranslateService = inject(NativeTranslateService);
	
	@ViewChild('nicknameForm') public nicknameForm?: NicknameFormComponent;
	@ViewChild('score') public scoreRef?: ElementRef<HTMLDivElement>;
	@ViewChild("buttonSoundOnOffComponent") buttonSoundOnOffComponent!: ButtonSoundOnOffComponent;
	@ViewChild("buttonFullscreenComponent") buttonFullscreenComponent!: ButtonFullscreenComponent;
	@ViewChild('confetti') public confetti!: ConfettiComponent;
	
	protected readonly signalIsShowingCompleted = signal<boolean>(false);
	protected readonly isShowingConfirmCancelDialog = signal<boolean>(false);
	protected readonly isShowingQuestionsResultDialog = signal<boolean>(false);
	protected readonly signalTitleText = signal<string | null>(null);
	protected readonly signalContentText = signal<string | null>(null);
	protected readonly signalStarImageUrl = signal<string>('none');
	
	protected frontImageUrl: string = 'none';
	protected nicknameFormModel: NicknameFormModel | null = null;
	
	private backgroundSoundTimeoutSubscription: Subscription | null = null;
	private afterViewInitTimeoutSubscription: Subscription | null = null;
	private addImageSubscription: Subscription | null = null;
	
	protected readonly AppConfig = AppConfig;
	protected readonly SoundNameEnum = SoundNameEnum;
	protected readonly document = document;
	
	public ngOnInit(): void
	{
		if (
			this.initService.isScormPackage ||
			this.gameService.signalGameConfig() && !this.gameService.signalGameConfig()!.includesHighscore ||
			this.userGameService.signalGameScore().score <= 0
		)
		{
			this.gameService.signalHasEnteredHighscore.set(true);
		}
		
		const image: HTMLImageElement | null = this.imageLoadService.getImage('starImage');
		
		if (image)
		{
			this.signalStarImageUrl.set(`url('${image.src}')`);
		}
		
		const quizName: string = this.nativeTranslateService.instant('quiz-name');
		const text: string = this.nativeTranslateService.instant('end-game-text', {quizName: quizName});
		if (text !== 'end-game-text')
		{
			this.signalContentText.set(text);
			const result = this.splitAtClosingH5(text);
			
			if (result)
			{
				this.signalTitleText.set(result.title);
				this.signalContentText.set(result.rest);
			}
		}
		
		/* if (this.gameScoreService.doesGsNumberExists(this.userGameService.signalGameScore().gsNumber))
		{
			const gameScore = this.gameScoreService.getGameScoreByGsNumber(this.userGameService.signalGameScore().gsNumber);
			
			if (gameScore)
			{
				this.nicknameFormModel = new NicknameFormModel(gameScore.nickname);
			}
		}*/
		
		this.backgroundSoundTimeoutSubscription = UtilTimeout.setTimeout(
			() => {
				this.backgroundSoundTimeoutSubscription = null;
				this.soundService.playBackgroundSound(SoundNameEnum.endGameMusic);
			}, 500);
		
		this.addImageSubscription = this.imageLoadService.addImageEmitter.subscribe((id: string) => {
			if (
				id === 'crabFrontImage' ||
				id === 'btnSoundOn' ||
				id === 'btnSoundOff' ||
				id === 'btnFullscreenOn' ||
				id === 'btnFullscreenOff'
			)
			{
				this.getImages();
			}
		});
	}
	
	public ngAfterViewInit(): void
	{
		this.getImages();
		
		this.callScoreTween(this.scoreRef);
		
		this.afterViewInitTimeoutSubscription = UtilTimeout.setTimeout(() => {
			this.afterViewInitTimeoutSubscription = null;
			this.callScoreTween(this.scoreRef);
			this.signalIsShowingCompleted.set(true);
			
			if (!this.gameService.signalHasShownEndGameConfetti())
			{
				this.gameService.signalHasShownEndGameConfetti.set(true);
				this.confetti.callConfetti();
				this.soundService.playSound(SoundNameEnum.endGame, true);
			}
		}, 1000);
	}
	
	public ngOnDestroy(): void
	{
		if (this.backgroundSoundTimeoutSubscription)
		{
			this.backgroundSoundTimeoutSubscription.unsubscribe();
			this.backgroundSoundTimeoutSubscription = null;
		}
		
		if (this.afterViewInitTimeoutSubscription)
		{
			this.afterViewInitTimeoutSubscription.unsubscribe();
			this.afterViewInitTimeoutSubscription = null;
		}
		
		if (this.addImageSubscription)
		{
			this.addImageSubscription.unsubscribe();
			this.addImageSubscription = null;
		}
	}
	
	private splitAtClosingH5(html: string): { title: string; rest: string } | null
	{
		const closingTag = "</h5>";
		const idx: number = html.indexOf(closingTag);
		if (idx === -1)
		{
			return null;
		}
		
		// end of closing tag (including length of tag)
		const splitPos = idx + closingTag.length;
		
		const title = html.slice(0, splitPos); // all incl. </h5>
		const rest = html.slice(splitPos); // after that
		
		return {title, rest};
	}
	
	protected onCancelForm(isSaved: boolean): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		this.isShowingConfirmCancelDialog.set(true);
		this.soundService.playSound('modalFadeIn', true);
		
		if (isSaved)
		{
			// nothing to do
		}
	}
	
	protected onClickCloseQuestionsResult(): void
	{
		this.isShowingQuestionsResultDialog.set(false);
		this.soundService.playSound('modalFadeOut', true);
		
		/*UtilTimeout.setTimeout(() => {
			this.callScoreTween(this.scoreRef);
		}, 100);*/
	}
	
	protected onSubmitForm(formModel: NicknameFormModel): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		this.userGameService.setNickname(formModel.nickname);
		
		this.saveHighscoreEntry(formModel.nickname, null);
	}
	
	protected onClickShowQuestionsResult(): void
	{
		/*if (this.gameService.gameQuestionResultList.length === 0)
		{
			const list: Array<TopicQuestionResultModel> = [];
			list.push(new TopicQuestionResultModel(1, 100, 100, 100, 100, 1, true, true, true, 'Top or Flop auf der Hop', 'What is the capital big man of France?What is the of France?', 'Pariser Paris man', 'Paris', 'ROB'));
			list.push(new TopicQuestionResultModel(1, 100, 100, 100, 100, 1, true, false, false, 'Top or Flop auf der Hop', 'What is 2 + 2?', '4', '4', '8'));
			list.push(new TopicQuestionResultModel(2, 100, 100, 100, 100, 1, false, true, false, 'Samba or Knusper', 'What is the capital of Germany?', 'Berlin', 'Munich', 'Berlin'));
			list.push(new TopicQuestionResultModel(2, 100, 100, 100, 100, 1, true, true, true, 'Samba or Knusper', 'What is the capital of Italy?', 'Rome', 'Rome', 'Robe'));
			list.push(new TopicQuestionResultModel(2, 100, 100, 100, 100, 1, false, null, false, 'Samba or Knusper', 'What is 5 * 6?', '30', '28', '30'));
			list.push(new TopicQuestionResultModel(2, 100, 100, 100, 100, 1, true, true, true, 'Samba or Knusper', 'What is 5 + 6?', '11', '11', '22'));
			list.push(new TopicQuestionResultModel(3, 100, 100, 100, 100, 1, false, true, false, 'Pit or Pat', 'What is 5 - 6?', '-1', '1', '-1'));
			list.push(new TopicQuestionResultModel(3, 100, 100, 100, 100, 1, true, true, true, 'Pit or Pat', 'What is 5 / 6?', '0.8333333333333334', '0.8333333333333334', '0.75'));
			list.push(new TopicQuestionResultModel(3, 100, 100, 100, 100, 1, false, true, false, 'Pit or Pat', 'What is the capital of Spain?', 'Madrid', 'Barcelona', 'Madrid'));
			
			this.gameService.gameQuestionResultList = list;
		}*/
		
		this.soundService.playSound(SoundNameEnum.click, true);
		this.isShowingQuestionsResultDialog.set(true);
		this.soundService.playSound('modalFadeIn', true);
	}
	
	protected onClickHighScore(): void
	{
		if (this.gameService.signalHasEnteredHighscore())
		{
			//this.soundService.fadeOutSound(SoundNameEnum.endGameMusic, 500, StopTypeEnum.stop);
			this.soundService.playSound(SoundNameEnum.click, true);
			
			this.gameService.highscorePageBackRoute = AppRoutesEnum.endGame;
			this.initService.navigateToRoute(AppRoutesEnum.highScoreWeekly).then();
		}
		else
		{
			if (!this.nicknameForm?.formGroup.invalid)
			{
				this.soundService.playSound(SoundNameEnum.click, true);
				const nickname = this.nicknameForm?.f['nickname'].value ?? '';
				
				this.userGameService.setNickname(nickname);
				
				this.gameService.highscorePageBackRoute = AppRoutesEnum.endGame;
				this.saveHighscoreEntry(nickname, AppRoutesEnum.highScoreWeekly);
				return;
			}
			else
			{
				this.nicknameForm?.onSubmitForm();
			}
		}
	}
	
	private saveHighscoreEntry(nickname: string, navigateRoute: AppRoutesEnum | null): void
	{
		this.gameScoreBackendService.getHighScoreSaveToken(
			this.userGameService.signalGameScore().score,
			this.userGameService.signalGameScore().correctRate
		).pipe(untilDestroyed(this)).subscribe(
			{
				next: (response: { timestamp: number, token: string } | null) => {
					if (!response)
					{
						return;
					}
					
					this.gameScoreBackendService.addHighScore(
						response.timestamp,
						response.token,
						nickname,
						this.userGameService.signalGameScore().score,
						this.userGameService.signalGameScore().correctRate
					).pipe(untilDestroyed(this)).subscribe(
						{
							complete: () => {
								//		console.log('complete')
								this.gameScoreService.addGameScore(this.userGameService.signalGameScore());
								this.gameService.signalHasEnteredHighscore.set(true);
								
								// special reset of game values
								if (navigateRoute === AppRoutesEnum.base)
								{
									this.endGame();
								}
								else if (navigateRoute)
								{
									this.initService.navigateToRoute(navigateRoute).then();
								}
							},
							error: (error: string) => {
								this.toastService.showToast(error, ToastTypeEnum.error);
							}
						}
					);
				},
				error: (error: string) => {
					this.toastService.showToast(error, ToastTypeEnum.error);
				}
			});
	}
	
	protected onClickEndGame(): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		
		if (this.gameService.signalHasEnteredHighscore())
		{
			this.endGame();
		}
		else
		{
			if (!this.nicknameForm?.formGroup.invalid)
			{
				const nickname = this.nicknameForm?.f['nickname'].value ?? '';
				
				this.userGameService.setNickname(nickname);
				this.saveHighscoreEntry(nickname, AppRoutesEnum.base);
				return;
			}
			else
			{
				this.isShowingConfirmCancelDialog.set(true);
				this.soundService.playSound('modalFadeIn', true);
			}
		}
	}
	
	protected onClickNoHighscoreSaving(isConfirmed: boolean): void
	{
		this.isShowingConfirmCancelDialog.set(false);
		
		if (isConfirmed)
		{
			UtilTimeout.setTimeout(
				() => {
					const nickname: string = this.nativeTranslateService.instant('anonymous');
					this.userGameService.setNickname(nickname);
					this.saveHighscoreEntry(nickname, AppRoutesEnum.base);
				}, 500
			);
		}
	}
	
	private endGame(): void
	{
		this.soundService.fadeOutSound(SoundNameEnum.endGameMusic, 500, StopTypeEnum.stop);
		this.gameService.init();
		this.initService.navigateToRoute(AppRoutesEnum.base).then();
	}
	
	/*protected onClickStartNewGame(): void
	{
		this.soundService.fadeOutSound(SoundNameEnum.endGameMusic, 500, StopTypeEnum.stop);
		this.soundService.playSound(SoundNameEnum.click, true);
		this.gameService.init();
		this.initService.navigateToRoute(AppRoutesEnum.gameTopic).then();
	}*/
	
	private callScoreTween(scoreRef?: ElementRef<HTMLDivElement>): void
	{
		if (!scoreRef)
		{
			return;
		}
		
		const startScore: number = 0;
		const targetScore: number = this.userGameService.signalGameScore().score;
		
		const timeline = gsap.timeline();
		gsap.killTweensOf(scoreRef.nativeElement);
		timeline.from(scoreRef.nativeElement, {opacity: 1});
		timeline.counter(scoreRef.nativeElement, {
			start: startScore,
			end: targetScore,
			ease: "linear",
			onComplete: () => {
				//
			}
		}, "-=0.5");
	}
	
	private getImages(): void
	{
		const image: HTMLImageElement | null = this.imageLoadService.getImage('crabFrontImage');
		
		if (image)
		{
			this.frontImageUrl = `url('${image.src}')`;
		}
		
		const imageSoundOnUrl: HTMLImageElement | null = this.imageLoadService.getImage('btnSoundOn');
		const imageSoundOffUrl: HTMLImageElement | null = this.imageLoadService.getImage('btnSoundOff');
		const imageFullscreenOn: HTMLImageElement | null = this.imageLoadService.getImage('btnFullscreenOn');
		const imageFullscreenOff: HTMLImageElement | null = this.imageLoadService.getImage('btnFullscreenOff');
		
		if (imageSoundOnUrl && imageSoundOffUrl && imageFullscreenOn && imageFullscreenOff)
		{
			this.buttonFullscreenComponent.initImages(imageFullscreenOn.src, imageFullscreenOff.src);
			this.buttonSoundOnOffComponent.initImages(imageSoundOnUrl.src, imageSoundOffUrl.src);
		}
	}
	
	/*protected onClickTestConfetti()
	{
		this.confetti.callConfetti();
	}*/
}
