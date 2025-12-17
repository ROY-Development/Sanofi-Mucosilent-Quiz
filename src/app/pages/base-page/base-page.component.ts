import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	inject,
	OnDestroy,
	OnInit,
	signal,
	ViewChild
} from '@angular/core';
import {InitService} from '../../core/services/init.service';
import {SoundService} from '../../core/services/sound.service';
import {FileLoadService} from '../../core/services/file-load.service';
import {AppBackendConfigService} from '../../core/services/app-backend-config.service';
import {UntilDestroy} from '@ngneat/until-destroy';
import {SoundNameEnum} from '../../shared/enums/sound-name.enum';
import {AppRoutesEnum} from '../../app-routes.enum';
import {AppModule} from '../../app.module';
import {GameService} from '../../core/services/game.service';
import {UtilTimeout} from '../../shared/utils/util-timeout';
import {ButtonFullscreenComponent} from '../../shared/components/button-fullscreen/button-fullscreen.component';
import {Subscription} from 'rxjs';
import {ImageLoadService} from '../../core/services/image-load.service';
import {ButtonSoundOnOffComponent} from '../../shared/components/button-sound-on-off/button-sound-on-off.component';
import {ViewTransitionService} from '../../core/services/view-transition.service';
import {AppConfig} from '../../app.config';
import {StopTypeEnum} from '../../games/enums/stop-type.enum';

@UntilDestroy()
@Component({
	selector: 'app-base-page',
	templateUrl: './base-page.component.html',
	styleUrl: './base-page.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: false
})
export class BasePageComponent implements OnInit, AfterViewInit, OnDestroy
{
	protected fileLoadService = inject(FileLoadService);
	protected initService = inject(InitService);
	protected gameService = inject(GameService);
	protected soundService = inject(SoundService);
	protected appBackendConfigService = inject(AppBackendConfigService);
	private imageLoadService = inject(ImageLoadService);
	private viewTransitionService = inject(ViewTransitionService);
	
	@ViewChild("buttonSoundOnOffComponent") buttonSoundOnOffComponent!: ButtonSoundOnOffComponent;
	@ViewChild("buttonFullscreenComponent") buttonFullscreenComponent!: ButtonFullscreenComponent;
	
	// noinspection CssUnknownProperty
	@HostBinding('style.--button-start-scale-to')
	protected get scaleTo(): string
	{
		const scaleTo: number = this.gameService.signalGameConfig()?.startBtn?.pulseScale ?? 0.95;
		return scaleTo.toString();
	}
	
	protected readonly signalClickedStart = signal<boolean>(false);
	protected readonly legalTextDialogType =
		signal<'imprint' | 'privacy-policy' | 'crm-info' | null>(null);
	
	// protected readonly signalGameLogoImageUrl = signal<string | null>(null);
	protected readonly signalBtnPlayImageUrl = signal<string>('none');
	
	private backgroundSoundTimeoutSubscription: Subscription | null = null;
	private addImageSubscription: Subscription | null = null;
	
	protected readonly AppConfig = AppConfig;
	protected readonly AppModule = AppModule;
	protected readonly SoundNameEnum = SoundNameEnum;
	protected readonly document = document;
	
	constructor()
	{
		this.addImageSubscription = this.imageLoadService.addImageEmitter.subscribe((id: string) => {
			if (
				id === 'btnPlayImage' ||
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
	
	public ngOnInit(): void
	{
		this.soundService.setInitCallback(() => {
			UtilTimeout.setTimeout(() => {
				// start background music only if the user didn't click the start-button yet
				if (!this.signalClickedStart())
				{
	//				this.soundService.playBackgroundSound(SoundNameEnum.introMusic);
				}
			}, 100);
		});
		
		// set this off if the result music differs from question music
		this.soundService.fadeOutSound(SoundNameEnum.mainMusic01, 500, StopTypeEnum.stop);
		this.soundService.fadeOutSound(SoundNameEnum.mainMusic02, 500, StopTypeEnum.stop);
		this.soundService.fadeOutSound(SoundNameEnum.mainMusic03, 500, StopTypeEnum.stop);
		this.backgroundSoundTimeoutSubscription = UtilTimeout.setTimeout(
			() => {
				this.backgroundSoundTimeoutSubscription = null;
	//			this.soundService.playBackgroundSound(SoundNameEnum.introMusic);
			}, 500);
	}
	
	public ngAfterViewInit(): void
	{
		this.getImages();
		
		this.viewTransitionService.isEnabled = true;
	}
	
	public ngOnDestroy(): void
	{
		this.soundService.unsetInitCallback();
		
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
	
	protected onClickStart(): void
	{
		if (this.signalClickedStart())
		{
			return;
		}
		
		this.soundService.unsetInitCallback();
		
		this.signalClickedStart.set(true);
		
		this.soundService.unsetInitCallback();
		
		this.soundService.playSound(SoundNameEnum.click, true);
		this.soundService.playSound(SoundNameEnum.buttonSelected, true);
		
		this.gameService.init();
		
		this.soundService.fadeOutSound(SoundNameEnum.introMusic, 1500);
		
		this.initService.navigateToRoute(AppRoutesEnum.question).then();
	}
	
	protected onClickHowToPLay(): void
	{
		if (this.signalClickedStart())
		{
			return;
		}
		
		this.soundService.playSound(SoundNameEnum.click, true);
		this.initService.navigateToRoute(AppRoutesEnum.howToPlay).then();
	}
	
	protected onClickLegalText(type: 'imprint' | 'privacy-policy' | 'crm-info'): void
	{
		if (this.signalClickedStart())
		{
			return;
		}
		
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
		
		if (url)
		{
			window.open(url, '_blank');
		}
	}
	
	protected onClickCloseLegal(ev: boolean): void
	{
		if (ev)
		{
			//
		}
		
		this.legalTextDialogType.set(null);
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
		
		const image: HTMLImageElement | null = this.imageLoadService.getImage('btnPlayImage');
		if (image)
		{
			this.signalBtnPlayImageUrl.set(`url('${image.src}')`);
		}
	}
}
