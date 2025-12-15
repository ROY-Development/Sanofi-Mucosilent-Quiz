import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ImageLoadService} from '../../core/services/image-load.service';
import {SoundService} from '../../core/services/sound.service';
import {SoundNameEnum} from '../../shared/enums/sound-name.enum';
import {InitService} from '../../core/services/init.service';
import {AppRoutesEnum} from '../../app-routes.enum';
import {GameQuestionsService} from '../../core/services/game-questions.service';
import {Subscription} from 'rxjs';
import {UtilTimeout} from '../../shared/utils/util-timeout';

@Component({
	selector: 'app-question-page',
	standalone: false,
	templateUrl: './question-page.component.html',
	styleUrl: './question-page.component.scss'
})
export class QuestionPageComponent implements OnInit, OnDestroy
{
	protected initService = inject(InitService);
	protected gameQuestionsService = inject(GameQuestionsService);
	protected soundService = inject(SoundService);
	private imageLoadService = inject(ImageLoadService);
	
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
		
		const songName: SoundNameEnum = SoundNameEnum.mainMusic01;
		this.soundService.fadeOutSound(SoundNameEnum.introMusic, 2000);
		this.backgroundSoundTimeoutSubscription = UtilTimeout.setTimeout(
			() => {
				this.backgroundSoundTimeoutSubscription = null;
				this.soundService.playBackgroundSound(songName);
			}, 1600// 500
		);
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
		this.soundService.playSound(SoundNameEnum.click, true);
		this.isShowingConfirmCancelDialog.set(true);
		this.soundService.playSound('modalFadeIn', true);
	}
	
	protected onCancel(isCanceled: boolean): void
	{
		if (isCanceled)
		{
			this.gameQuestionsService.init();
			
			this.initService.navigateToRoute(AppRoutesEnum.base).then();
		}
		else
		{
			this.isShowingConfirmCancelDialog.set(false);
		}
	}
	
	protected onClickAnswer(index: number): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		this.gameQuestionsService.selectAnswer(index);
		
		this.initService.navigateToRoute(AppRoutesEnum.questionResult).then();
	}
}
