import {AfterViewInit, Component, inject, OnDestroy, OnInit, signal, ViewChild} from '@angular/core';
import {InitService} from '../../core/services/init.service';
import {GameQuestionsService} from '../../core/services/game-questions.service';
import {SoundService} from '../../core/services/sound.service';
import {ImageLoadService} from '../../core/services/image-load.service';
import {SoundNameEnum} from '../../shared/enums/sound-name.enum';
import {AppRoutesEnum} from '../../app-routes.enum';
import {StopTypeEnum} from '../../games/enums/stop-type.enum';
import {Subscription} from 'rxjs';
import {UtilTimeout} from '../../shared/utils/util-timeout';
import {ConfettiComponent} from '../../shared/components/confetti/confetti.component';

@Component({
	selector: 'app-question-end',
	standalone: false,
	templateUrl: './question-end-page.component.html',
	styleUrl: './question-end-page.component.scss'
})
export class QuestionEndPageComponent implements OnInit, AfterViewInit, OnDestroy
{
	protected initService = inject(InitService);
	protected gameQuestionsService = inject(GameQuestionsService);
	protected soundService = inject(SoundService);
	private imageLoadService = inject(ImageLoadService);
	
	@ViewChild('confetti') public confetti!: ConfettiComponent;
	
	protected readonly signalProductBgImageUrl = signal<string>('none');
	protected readonly signalHeaderBgImageUrl = signal<string>('none');
	protected readonly signalBillyHeadImageUrl = signal<string>('none');
	protected readonly signalBillyLeftImageUrl = signal<string>('none');
	protected readonly signalBillyRightImageUrl = signal<string>('none');
	protected readonly signalProductImageUrl = signal<string>('none');
	protected readonly signalBtnBgImageUrl = signal<string>('none');
	
	protected readonly isShowingConfirmCancelDialog = signal<boolean>(false);
	
	protected readonly signalBtnCloseImageUrl = signal<string>('none');
	
	private backgroundSoundTimeoutSubscription: Subscription | null = null;
	private addImageSubscription: Subscription | null = null;
	
	public ngOnInit(): void
	{
		this.addImageSubscription = this.imageLoadService.addImageEmitter.subscribe((id: string) => {
			if (
				id === 'productBg' ||
				id === 'btnClose' ||
				id === 'productHeaderBg' ||
				id === 'billyHead' ||
				id === 'billyLeft' ||
				id === 'billyRight' ||
				id === 'productImage' ||
				id === 'productBtnBgImage'
			)
			{
				this.getImages();
			}
		});
		
		/*const songName: SoundNameEnum = SoundNameEnum.endGameMusic;
		this.soundService.fadeOutSound(SoundNameEnum.mainMusic01, 2000);
		this.backgroundSoundTimeoutSubscription = UtilTimeout.setTimeout(
			() => {
				this.backgroundSoundTimeoutSubscription = null;
				this.soundService.playBackgroundSound(songName);
			}, 1600// 500
		);*/
	}
	
	public ngAfterViewInit(): void
	{
		this.getImages();
		
		this.confetti.callConfetti();
		
		UtilTimeout.setTimeout(() => {
			this.soundService.playSound(SoundNameEnum.endGame, true);
		}, 600);
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
	
	protected onClickExit(): void
	{
		this.soundService.fadeOutSound(SoundNameEnum.endGameMusic, 500, StopTypeEnum.stop);
		
		this.soundService.playSound(SoundNameEnum.click, true);
		this.isShowingConfirmCancelDialog.set(true);
		// this.soundService.playSound('modalFadeIn', true);
		
		this.initService.navigateToRoute(AppRoutesEnum.base).then(() => {
			this.gameQuestionsService.init();
		});
	}
	
	private getImages(): void
	{
		let image: HTMLImageElement | null = this.imageLoadService.getImage('btnClose');
		if (image)
		{
			this.signalBtnCloseImageUrl.set(`url('${image.src}')`);
		}
		
		image = this.imageLoadService.getImage('productBg');
		if (image)
		{
			this.signalProductBgImageUrl.set(`url('${image.src}')`);
		}
		
		image = this.imageLoadService.getImage('productHeaderBg');
		if (image)
		{
			this.signalHeaderBgImageUrl.set(`url('${image.src}')`);
		}
		
		image = this.imageLoadService.getImage('billyHead');
		if (image)
		{
			this.signalBillyHeadImageUrl.set(`url('${image.src}')`);
		}
		
		image = this.imageLoadService.getImage('billyLeft');
		if (image)
		{
			this.signalBillyLeftImageUrl.set(`url('${image.src}')`);
		}
		
		image = this.imageLoadService.getImage('billyRight');
		if (image)
		{
			this.signalBillyRightImageUrl.set(`url('${image.src}')`);
		}
		
		image = this.imageLoadService.getImage('productImage');
		if (image)
		{
			this.signalProductImageUrl.set(`url('${image.src}')`);
		}
		
		image = this.imageLoadService.getImage('productBtnBgImage');
		if (image)
		{
			this.signalBtnBgImageUrl.set(`url('${image.src}')`);
		}
	}
}
