import {AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, signal, ViewChild} from '@angular/core';
import {ImageLoadService} from '../../core/services/image-load.service';
import {SoundService} from '../../core/services/sound.service';
import {SoundNameEnum} from '../../shared/enums/sound-name.enum';
import {InitService} from '../../core/services/init.service';
import {AppRoutesEnum} from '../../app-routes.enum';
import {GameQuestionsService} from '../../core/services/game-questions.service';
import {Subscription} from 'rxjs';
import {UtilTimeout} from '../../shared/utils/util-timeout';
import {AniExplosionComponent} from '../../shared/components/ani-explosion/ani-explosion.component';

@Component({
	selector: 'app-question-page',
	standalone: false,
	templateUrl: './question-page.component.html',
	styleUrl: './question-page.component.scss'
})
export class QuestionPageComponent implements OnInit, AfterViewInit, OnDestroy
{
	private changeDetectorRef = inject(ChangeDetectorRef);
	
	@ViewChild("aniExplosion") aniExplosion?: AniExplosionComponent;
	
	protected initService = inject(InitService);
	protected gameQuestionsService = inject(GameQuestionsService);
	protected soundService = inject(SoundService);
	private imageLoadService = inject(ImageLoadService);
	
	protected readonly isShowingConfirmCancelDialog = signal<boolean>(false);
	
	protected readonly signalBtnCloseImageUrl = signal<string>('none');
	
	protected scratchFreeBg: HTMLImageElement = new Image();
	protected scratchMonster1: HTMLImageElement = new Image();
	protected scratchMonster2: HTMLImageElement = new Image();
	protected scratchMonster3: HTMLImageElement = new Image();
	
	protected imgCorrect: HTMLImageElement = new Image();
	protected imgWrong: HTMLImageElement = new Image();
	protected readonly signalCorrectImageUrl = signal<string>('none');
	protected readonly signalWrongImageUrl = signal<string>('none');
	
	protected readonly signalScratchFinished = signal<boolean>(false);
	
	private backgroundSoundTimeoutSubscription: Subscription | null = null;
	private addImageSubscription: Subscription | null = null;
	
	public ngOnInit(): void
	{
		const songName: SoundNameEnum = SoundNameEnum.mainMusic01;
		this.soundService.fadeOutSound(SoundNameEnum.introMusic, 2000);
		this.backgroundSoundTimeoutSubscription = UtilTimeout.setTimeout(
			() => {
				this.backgroundSoundTimeoutSubscription = null;
				this.soundService.playBackgroundSound(songName);
			}, 1600// 500
		);
		
		this.addImageSubscription = this.imageLoadService.addImageEmitter.subscribe((id: string) => {
			if (
				id === 'btnClose' ||
				id === 'scratchFreeBg' ||
				//id === 'scratchFree01' ||
				id === 'prBillyPhotoRoom' ||
				id === 'prLiliPushingPhotoRoom' ||
				id === 'prCouple' ||
				id === 'imgCorrect' ||
				id === 'imgWrong'
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
	
	protected onScratch(answerIndex: number, scratchFactor: number): void
	{
		const rnd: number = Math.floor(Math.random() * 3);
		
		if (rnd === 0)
		{
			this.soundService.playSound(SoundNameEnum.scratch01, true);
		}
		else if (rnd === 1)
		{
			this.soundService.playSound(SoundNameEnum.scratch02, true);
		}
		
		this.gameQuestionsService.currentQuestion.answers[answerIndex].scratchFactor = scratchFactor / 0.9;
	}
	
	protected onScratchFinished(answerIndex: number): void
	{
		this.signalScratchFinished.set(true);
		
		this.gameQuestionsService.currentQuestion.answers[answerIndex].scratchFactor = 1;
		
		const soundName = this.gameQuestionsService.currentQuestion.rightAnswerIndex === answerIndex ?
			SoundNameEnum.answerRight : SoundNameEnum.answerWrong;
		this.soundService.playSound(soundName, true);
		
		this.gameQuestionsService.selectAnswer(answerIndex);
		
		// call explosion
		this.changeDetectorRef.detectChanges();
		this.aniExplosion?.callExplosion(360 * 0.5, 360 * 0.35, 200);
		
		UtilTimeout.setTimeout(() => {
			this.initService.navigateToRoute(AppRoutesEnum.questionResult).then();
		}, 2000);
	}
	
	/*protected onClickAnswer(index: number): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		this.gameQuestionsService.selectAnswer(index);
		
		this.initService.navigateToRoute(AppRoutesEnum.questionResult).then();
	}*/
	
	private getImages(): void
	{
		let image: HTMLImageElement | null = this.imageLoadService.getImage('btnClose');
		if (image)
		{
			this.signalBtnCloseImageUrl.set(`url('${image.src}')`);
		}
		
		image = this.imageLoadService.getImage('scratchFreeBg');
		if (image)
		{
			this.scratchFreeBg = image;
		}
		
		image = this.imageLoadService.getImage('prBillyPhotoRoom');
		if (image)
		{
			this.scratchMonster1 = image;
		}
		
		image = this.imageLoadService.getImage('prLiliPushingPhotoRoom');
		if (image)
		{
			this.scratchMonster2 = image;
		}
		
		image = this.imageLoadService.getImage('prCouple');
		if (image)
		{
			this.scratchMonster3 = image;
		}
		
		image = this.imageLoadService.getImage('imgCorrect');
		if (image)
		{
			this.imgCorrect = image;
			this.signalCorrectImageUrl.set(`url('${image.src}')`);
		}
		
		image = this.imageLoadService.getImage('imgWrong');
		if (image)
		{
			this.imgWrong = image;
			this.signalWrongImageUrl.set(`url('${image.src}')`);
		}
	}
}
