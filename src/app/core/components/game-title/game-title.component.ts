import {AfterViewInit, Component, inject, OnDestroy, signal} from '@angular/core';
import {ImageLoadService} from '../../services/image-load.service';
import {GameService} from '../../services/game.service';
import {Subscription} from 'rxjs';

@Component({
	selector: 'app-game-title',
	templateUrl: './game-title.component.html',
	styleUrls: ['./game-title.component.scss'],
	standalone: false
})
export class GameTitleComponent implements AfterViewInit, OnDestroy
{
	protected gameService = inject(GameService);
	// private initService = inject(InitService);
	// private fileLoadService = inject(FileLoadService);
	private imageLoadService = inject(ImageLoadService);
	
	// public appConfig = computed(() => this.initService.signalAppConfig());
	
	protected readonly signalIsShowingLogo = signal<boolean>(false);
	protected readonly signalLogoImageUrl = signal<string>('none');
	
	private addImageSubscription: Subscription | null = null;
	
	constructor()
	{
		/*effect(() => {
			if (!this.fileLoadService.signalIsLoading())
			{
				let image: HTMLImageElement | null;
				
				image = this.imageLoadService.getImage('companyLogoImage');
				if (this.signalLogoImageUrl() === 'none' && image)
				{
					this.signalLogoImageUrl.set(image.src); // .set(`url('${image.src}')`);
				}
			}
		});*/
		
		this.addImageSubscription = this.imageLoadService.addImageEmitter.subscribe((id: string) => {
			if (id === 'companyLogoImage')
			{
				this.getImages();
			}
		});
	}
	
	public ngAfterViewInit(): void
	{
		this.getImages();
		//UtilTimeout.setTimeout(() => {
		this.signalIsShowingLogo.set(true);
		//}, 300);
	}
	
	public ngOnDestroy(): void
	{
		if (this.addImageSubscription)
		{
			this.addImageSubscription.unsubscribe();
			this.addImageSubscription = null;
		}
	}
	
	private getImages(): void
	{
		const image: HTMLImageElement | null = this.imageLoadService.getImage('companyLogoImage');
		if (image)
		{
			this.signalLogoImageUrl.set(image.src); // .set(`url('${image.src}')`);
		}
	}
	
	protected onClickLogo(): void
	{
		let url: string;
		
		if (this.gameService.signalGameConfig() && this.gameService.signalGameConfig()!.urlCompany)
		{
			url = this.gameService.signalGameConfig()!.urlCompany!;
		}
		else
		{
			url = 'https://www.r-o-y.de';
		}
		
		window.open(url, '_blank');
	}
}
