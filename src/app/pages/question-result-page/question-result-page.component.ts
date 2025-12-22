import {AfterViewInit, Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {InitService} from '../../core/services/init.service';
import {GameQuestionsService} from '../../core/services/game-questions.service';
import {SoundService} from '../../core/services/sound.service';
import {ImageLoadService} from '../../core/services/image-load.service';
import {SoundNameEnum} from '../../shared/enums/sound-name.enum';
import {AppRoutesEnum} from '../../app-routes.enum';
import {Subscription} from 'rxjs';

@Component({
	selector: 'app-question-result-page',
	standalone: false,
	templateUrl: './question-result-page.component.html',
	styleUrl: './question-result-page.component.scss'
})
export class QuestionResultPageComponent implements OnInit, AfterViewInit, OnDestroy
{
	protected initService = inject(InitService);
	protected gameQuestionsService = inject(GameQuestionsService);
	protected soundService = inject(SoundService);
	private imageLoadService = inject(ImageLoadService);
	
	protected readonly isShowingConfirmCancelDialog = signal<boolean>(false);
	
	protected readonly signalProductBgImageUrl = signal<string>('none');
	protected readonly signalTitleBgImageUrl = signal<string>('none');
	protected readonly signalTitleAnswerBgImageUrl = signal<string>('none');
	protected readonly signalBtnCloseImageUrl = signal<string>('none');
	protected readonly signalBillyHeadImageUrl = signal<string>('none');
	protected readonly signalBillyLeftImageUrl = signal<string>('none');
	protected readonly signalBillyRightImageUrl = signal<string>('none');
	protected readonly signalTitleFeedback1BgImageUrl = signal<string>('none');
	protected readonly signalTitleFeedback2BgImageUrl = signal<string>('none');
	protected readonly signalTitleFeedback3BgImageUrl = signal<string>('none');
	protected readonly signalBtnBgImageUrl = signal<string>('none');
	
	private addImageSubscription: Subscription | null = null;
	
	public ngOnInit(): void
	{
		//this.gameQuestionsService.setNextQuestion();
		//this.gameQuestionsService.setNextQuestion();
		
		this.addImageSubscription = this.imageLoadService.addImageEmitter.subscribe((id: string) => {
			if (
				id === 'btnClose' ||
				id === 'productBg' ||
				id === 'productResultTitleBg' ||
				id === 'productResultAnswerBg' ||
				id === 'productResultFeedback1' ||
				id === 'billyHead' ||
				id === 'billyLeft' ||
				id === 'billyRight' ||
				id === 'productBtnBgImage'
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
	
	protected onClickNextQuestion()
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		if (this.gameQuestionsService.questionIndex < this.gameQuestionsService.questions.length - 1)
		{
			this.initService.navigateToRoute(AppRoutesEnum.question).then(() => {
				this.gameQuestionsService.setNextQuestion();
			});
		}
		else
		{
			this.initService.navigateToRoute(AppRoutesEnum.questionEnd).then();
		}
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
		
		image = this.imageLoadService.getImage('productResultTitleBg');
		if (image)
		{
			this.signalTitleBgImageUrl.set(`url('${image.src}')`);
		}
		
		image = this.imageLoadService.getImage('productResultAnswerBg');
		if (image)
		{
			this.signalTitleAnswerBgImageUrl.set(`url('${image.src}')`);
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
		
		image = this.imageLoadService.getImage('productResultFeedback1');
		if (image)
		{
			this.signalTitleFeedback1BgImageUrl.set(`url('${image.src}')`);
		}
		
		image = this.imageLoadService.getImage('productResultFeedback2');
		if (image)
		{
			this.signalTitleFeedback1BgImageUrl.set(`url('${image.src}')`);
		}
		
		image = this.imageLoadService.getImage('productResultFeedback3');
		if (image)
		{
			this.signalTitleFeedback1BgImageUrl.set(`url('${image.src}')`);
		}
		
		image = this.imageLoadService.getImage('productBtnBgImage');
		if (image)
		{
			this.signalBtnBgImageUrl.set(`url('${image.src}')`);
		}
	}
}