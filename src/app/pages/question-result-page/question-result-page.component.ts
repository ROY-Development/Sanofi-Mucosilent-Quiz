import {Component, inject, OnInit, signal} from '@angular/core';
import {InitService} from '../../core/services/init.service';
import {GameQuestionsService} from '../../core/services/game-questions.service';
import {SoundService} from '../../core/services/sound.service';
import {ImageLoadService} from '../../core/services/image-load.service';
import {SoundNameEnum} from '../../shared/enums/sound-name.enum';
import {AppRoutesEnum} from '../../app-routes.enum';

@Component({
	selector: 'app-question-result-page',
	standalone: false,
	templateUrl: './question-result-page.component.html',
	styleUrl: './question-result-page.component.scss'
})
export class QuestionResultPageComponent implements OnInit
{
	protected initService = inject(InitService);
	protected gameQuestionsService = inject(GameQuestionsService);
	protected soundService = inject(SoundService);
	private imageLoadService = inject(ImageLoadService);
	
	protected readonly isShowingConfirmCancelDialog = signal<boolean>(false);
	
	protected readonly signalBtnCloseImageUrl = signal<string>('none');
	
	public ngOnInit(): void
	{
		const image: HTMLImageElement | null = this.imageLoadService.getImage('btnClose');
		if (image)
		{
			this.signalBtnCloseImageUrl.set(`url('${image.src}')`);
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
			this.gameQuestionsService.setNextQuestion();
			this.initService.navigateToRoute(AppRoutesEnum.question).then();
		}
		else
		{
			this.initService.navigateToRoute(AppRoutesEnum.questionEnd).then();
		}
	}
}