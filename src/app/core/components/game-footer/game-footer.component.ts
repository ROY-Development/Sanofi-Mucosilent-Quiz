import {AfterViewInit, Component, inject, OnDestroy, signal} from '@angular/core';
import {SoundService} from '../../services/sound.service';
import {ImageLoadService} from '../../services/image-load.service';
import {Subscription} from 'rxjs';
import {SoundNameEnum} from '../../../shared/enums/sound-name.enum';

@Component({
	selector: 'app-game-footer',
	standalone: false,
	templateUrl: './game-footer.component.html',
	styleUrl: './game-footer.component.scss'
})
export class GameFooterComponent implements AfterViewInit, OnDestroy
{
	protected soundService = inject(SoundService);
	private imageLoadService = inject(ImageLoadService);
	
	protected readonly signalIsReady = signal<boolean>(false);
	protected readonly signalProductFooterBgImageUrl = signal<string>('none');
	
	private addImageSubscription: Subscription | null = null;
	
	constructor()
	{
		this.addImageSubscription = this.imageLoadService.addImageEmitter.subscribe((id: string) => {
			if (id === 'productFooterBg')
			{
				this.getImages();
			}
		});
	}
	
	public ngOnDestroy(): void
	{
		if (this.addImageSubscription)
		{
			this.addImageSubscription.unsubscribe();
			this.addImageSubscription = null;
		}
	}
	
	public ngAfterViewInit(): void
	{
		this.getImages();
		
		this.signalIsReady.set(true);
	}
	
	private getImages(): void
	{
		const image: HTMLImageElement | null = this.imageLoadService.getImage('productFooterBg');
		if (image)
		{
			this.signalProductFooterBgImageUrl.set(`url('${image.src}')`);
		}
	}
	
	protected onClickLegalText(type: 'imprint' | 'privacy-policy' | 'crm-info'): void
	{
		/*if (this.signalClickedStart())
		{
			return;
		}*/
		
		this.soundService.playSound(SoundNameEnum.click, true);
		
		let url: string = 'https://www.ehub-healthcare.com/de-de/s/legal-notice?language=de';
		window.open(url, '_blank');
		/*if (type === 'imprint')
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
		}*/
		/*else if (type === 'privacy-policy')
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
		}*/
	}
}
