import {Component, inject, OnInit, signal} from '@angular/core';
import {InitService} from '../../core/services/init.service';
import {GameQuestionsService} from '../../core/services/game-questions.service';
import {SoundService} from '../../core/services/sound.service';
import {ImageLoadService} from '../../core/services/image-load.service';
import {SoundNameEnum} from '../../shared/enums/sound-name.enum';
import {AppRoutesEnum} from '../../app-routes.enum';

@Component({
	selector: 'app-question-end',
	standalone: false,
	templateUrl: './question-end-page.component.html',
	styleUrl: './question-end-page.component.scss'
})
export class QuestionEndPageComponent implements OnInit
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
		// this.soundService.playSound('modalFadeIn', true);
		
		this.gameQuestionsService.init();
		this.initService.navigateToRoute(AppRoutesEnum.base).then();
	}
}
