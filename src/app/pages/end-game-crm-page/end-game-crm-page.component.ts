import {AfterViewInit, Component, inject, OnDestroy, OnInit, signal, ViewChild} from '@angular/core';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {Subscription} from 'rxjs';
import {SoundNameEnum} from '../../shared/enums/sound-name.enum';
import {UtilTimeout} from '../../shared/utils/util-timeout';
import {InitService} from '../../core/services/init.service';
import {SwipeYesNoService} from '../../games/swipe-yes-no/services/swipe-yes-no.service';
import {GameService} from '../../core/services/game.service';
import {UserCrmService} from '../../core/services/user-crm.service';
import {UserGameService} from '../../core/services/user-game.service';
import {SoundService} from '../../core/services/sound.service';
import {ImageLoadService} from '../../core/services/image-load.service';
import {ButtonSoundOnOffComponent} from '../../shared/components/button-sound-on-off/button-sound-on-off.component';
import {ButtonFullscreenComponent} from '../../shared/components/button-fullscreen/button-fullscreen.component';
import {AppRoutesEnum} from '../../app-routes.enum';
import {UserCrmFormModel} from '../../shared/models/user-crm-form.model';
import {ToastTypeEnum} from '../../shared/modules/toast/toast-type-enum';
import {ToastService} from '../../shared/modules/toast/toast.service';
import {StopTypeEnum} from '../../games/enums/stop-type.enum';
import {AppConfig} from '../../app.config';

@UntilDestroy()
@Component({
	selector: 'app-end-game-crm-page',
	templateUrl: './end-game-crm-page.component.html',
	styleUrl: './end-game-crm-page.component.scss',
	standalone: false
})
export class EndGameCrmPageComponent implements OnInit, AfterViewInit, OnDestroy
{
	protected initService = inject(InitService);
	protected swipeYesNoService = inject(SwipeYesNoService);
	protected gameService = inject(GameService);
	protected userCrmService = inject(UserCrmService);
	protected userGameService = inject(UserGameService);
	protected soundService = inject(SoundService);
	private toastService = inject(ToastService);
	private imageLoadService = inject(ImageLoadService);
	
	@ViewChild("buttonSoundOnOffComponent") buttonSoundOnOffComponent!: ButtonSoundOnOffComponent;
	@ViewChild("buttonFullscreenComponent") buttonFullscreenComponent!: ButtonFullscreenComponent;
	
	protected readonly legalTextDialogType =
		signal<'imprint' | 'privacy-policy' | 'crm-info' | null>(null);
	protected readonly isShowingConfirmCancelDialog = signal<boolean>(false);
	protected readonly signalIsNoScreenOverflow = signal<boolean>(false);
	
	private backgroundSoundTimeoutSubscription: Subscription | null = null;
	private addImageSubscription: Subscription | null = null;
	
	protected readonly AppConfig = AppConfig;
	protected readonly SoundNameEnum = SoundNameEnum;
	protected readonly document = document;
	
	public ngOnInit(): void
	{
		if (
			!this.gameService.signalGameConfig()?.quizConfigCrm ||
			!this.gameService.signalGameConfig()?.quizConfigCrm?.isEnabled
		)
		{
			this.initService.navigateToRoute(AppRoutesEnum.endGame).then();
			return;
		}
		
		this.backgroundSoundTimeoutSubscription = UtilTimeout.setTimeout(
			() => {
				this.backgroundSoundTimeoutSubscription = null;
				this.soundService.playBackgroundSound(SoundNameEnum.endGameMusic);
			}, 500);
		
		this.addImageSubscription = this.imageLoadService.addImageEmitter.subscribe((id: string) => {
			if (
				// id === 'crabFrontImage' ||
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
	
	protected onClickLegalText(type: 'imprint' | 'privacy-policy' | 'crm-info'): void
	{
		/*if (this.signalClickedStart())
		{
			return;
		}*/
		
		this.soundService.playSound(SoundNameEnum.click, true);
		
		let url: string | null = null;
		if (type === 'imprint')
		{
			if (
				this.gameService.signalGameConfig()?.typeImprint === 'url' &&
				this.gameService.signalGameConfig()?.urlImprint
			)
			{
				url = this.gameService.signalGameConfig()?.urlImprint ?? null;
			}
			else if (this.gameService.signalGameConfig()?.typeImprint === 'text')
			{
				this.legalTextDialogType.set('imprint');
				return;
			}
		}
		else if (type === 'privacy-policy')
		{
			if (
				this.gameService.signalGameConfig()?.typePrivacyPolicy === 'url' &&
				this.gameService.signalGameConfig()?.urlPrivacyPolicy
			)
			{
				url = this.gameService.signalGameConfig()?.urlPrivacyPolicy ?? null;
			}
			else if (this.gameService.signalGameConfig()?.typePrivacyPolicy === 'text')
			{
				
				this.legalTextDialogType.set('privacy-policy');
				return;
			}
		}
		else if (type === 'crm-info')
		{
			if (
				this.gameService.signalGameConfig()?.quizConfigCrm?.typeCollectInformation === 'url' &&
				this.gameService.signalGameConfig()?.quizConfigCrm?.urlCollectInformation
			)
			{
				url = this.gameService.signalGameConfig()?.quizConfigCrm?.urlCollectInformation ?? null;
			}
			else if (this.gameService.signalGameConfig()?.quizConfigCrm?.typeCollectInformation === 'text')
			{
				this.legalTextDialogType.set('crm-info');
				return;
			}
		}
		
		if (url)
		{
			window.open(url, '_blank');
		}
	}
	
	protected onClickCloseLegal(ev: any): void
	{
		if (ev)
		{
			//
		}
		
		this.legalTextDialogType.set(null);
	}
	
	protected onClickNoHighscoreSaving(isConfirmed: boolean): void
	{
		this.isShowingConfirmCancelDialog.set(false);
		
		if (isConfirmed)
		{
			this.signalIsNoScreenOverflow.set(true);
			
			UtilTimeout.setTimeout(
				() => {
					this.soundService.fadeOutSound(SoundNameEnum.endGameMusic, 500, StopTypeEnum.stop);
					this.initService.navigateToRoute(AppRoutesEnum.base).then();
					// this.signalHasEnteredHighscore.set(true);
				}, 350
			);
		}
	}
	
	protected onSubmitForm(formModel: UserCrmFormModel): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		
		this.userCrmService.getCRMValuesSaveToken(formModel).pipe(untilDestroyed(this)).subscribe(
			{
				next: (response: { timestamp: number, token: string } | null) => {
					if (!response)
					{
						return;
					}
					
					this.userCrmService.save(
						response.timestamp,
						response.token,
						formModel
					).pipe(untilDestroyed(this)).subscribe(
						{
							complete: () => {
								this.initService.navigateToRoute(AppRoutesEnum.endGame).then();
							},
							error: (error: string) => {
								this.toastService.showToast(error, ToastTypeEnum.error);
							}
						});
				},
				error: (error: string) => {
					this.toastService.showToast(error, ToastTypeEnum.error);
				}
			});
	}
	
	protected onCancelForm(isSaved: boolean): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		
		//const title: string = this.nativeTranslateService.instant('cancel');
		//const content: string = this.nativeTranslateService.instant('modal-dialog.discard-high-score');
		
		this.isShowingConfirmCancelDialog.set(true);
		this.soundService.playSound('modalFadeIn', true);
		
		if (isSaved)
		{
			//
		}
		
		/*this.modalService.openModalDialog(
			ModalConfirmComponent,
			(isConfirmed: boolean) => {
				if (isConfirmed)
				{
					UtilTimeout.setTimeout(
						() => {
							// this.soundService.fadeOutSound(SoundNameEnum.endGameMusic, 500, StopTypeEnum.stop);
							// this.initService.navigateToRoute(AppRoutesEnum.base).then();
							this.signalHasEnteredHighscore.set(true);
						}, 500
					);
				}
			},
			ModalSizeEnum.fixed,
			'800px', null,
			true, {
				title: title,
				content: content,
				isJsonContent: false,
				hasSafetyCheck: false
			}, '', true, true,
			() => {
			}
		);*/
		
		/*if (!isSaved)
		{
			this.soundService.fadeOutSound(SoundNameEnum.endGameMusic, 500, StopTypeEnum.stop);
			this.initService.navigateToRoute(AppRoutesEnum.base).then();
		}*/
	}
	
	private getImages(): void
	{
		/*let image: HTMLImageElement | null;
		
		image = this.imageLoadService.getImage('crabFrontImage');
		if (image)
		{
			this.frontImageUrl = `url('${image.src}')`;
		}*/
		
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
}
