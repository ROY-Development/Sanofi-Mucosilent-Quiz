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
	
	protected readonly isShowingConfirmCancelDialog = signal<boolean>(false);
	
	protected readonly signalBtnCloseImageUrl = signal<string>('none');
	
	private backgroundSoundTimeoutSubscription: Subscription | null = null;
	
	public ngOnInit(): void
	{
		const image: HTMLImageElement | null = this.imageLoadService.getImage('btnClose');
		if (image)
		{
			this.signalBtnCloseImageUrl.set(`url('${image.src}')`);
		}
		
		const songName: SoundNameEnum = SoundNameEnum.endGameMusic;
		this.soundService.fadeOutSound(SoundNameEnum.mainMusic01, 2000);
		this.backgroundSoundTimeoutSubscription = UtilTimeout.setTimeout(
			() => {
				this.backgroundSoundTimeoutSubscription = null;
				this.soundService.playBackgroundSound(songName);
			}, 1600// 500
		);
	}
	
	public ngAfterViewInit(): void
	{
		this.confetti.callConfetti();
		this.soundService.playSound(SoundNameEnum.endGame, true);
	}
	
	public ngOnDestroy(): void
	{
		if (this.backgroundSoundTimeoutSubscription)
		{
			this.backgroundSoundTimeoutSubscription.unsubscribe();
			this.backgroundSoundTimeoutSubscription = null;
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
}
