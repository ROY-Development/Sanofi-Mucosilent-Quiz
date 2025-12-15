import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {InitService} from '../../core/services/init.service';
import {AppRoutesEnum} from '../../app-routes.enum';
import {SoundService} from '../../core/services/sound.service';
import {SoundNameEnum} from '../../shared/enums/sound-name.enum';
import {UtilTimeout} from '../../shared/utils/util-timeout';
import {Subscription} from 'rxjs';
import {ImageLoadService} from '../../core/services/image-load.service';
import {GameService} from '../../core/services/game.service';
import {NativeTranslateService} from '../../core/services/native-translate.service';

@Component({
	selector: 'app-how-to-play-page',
	templateUrl: './how-to-play-page.component.html',
	styleUrl: './how-to-play-page.component.scss',
	standalone: false
})
export class HowToPlayPageComponent implements OnInit, OnDestroy
{
	protected initService = inject(InitService);
	protected gameService = inject(GameService);
	private imageLoadService = inject(ImageLoadService);
	private soundService = inject(SoundService);
	private nativeTranslateService = inject(NativeTranslateService);
	
	protected readonly signalBtnCloseImageUrl = signal<string>('none');
	protected readonly signalContentText = signal<string | null>(null);
	// protected imageUrlHowToPlay: string | null = null;
	
	private backgroundSoundTimeoutSubscription: Subscription | null = null;
	
	public ngOnInit(): void
	{
		const image: HTMLImageElement | null = this.imageLoadService.getImage('btnClose');
		if (image)
		{
			this.signalBtnCloseImageUrl.set(`url('${image.src}')`);
		}
		
		/*image = this.imageLoadService.getImage('howToPlay01');
		if (image)
		{
			this.imageUrlHowToPlay = image.src;
		}*/
		
		this.backgroundSoundTimeoutSubscription = UtilTimeout.setTimeout(() => {
				this.backgroundSoundTimeoutSubscription = null;
				this.soundService.playBackgroundSound(SoundNameEnum.introMusic);
			}, 500
		);
		
		const quizName: string = this.nativeTranslateService.instant('quiz-name');
		const text: string = this.nativeTranslateService.instant('how-to-play-text', {quizName: quizName});
		if (text !== 'how-to-play-text')
		{
			this.signalContentText.set(text);
		}
	}
	
	public ngOnDestroy(): void
	{
		if (this.backgroundSoundTimeoutSubscription)
		{
			this.backgroundSoundTimeoutSubscription.unsubscribe();
			this.backgroundSoundTimeoutSubscription = null;
		}
	}
	
	protected onClickClose(): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		this.initService.navigateToRoute(AppRoutesEnum.base).then();
	}
}
