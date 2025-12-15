import {Component, inject, OnInit, signal} from '@angular/core';
import {ImageLoadService} from '../../core/services/image-load.service';
import {SoundService} from '../../core/services/sound.service';
import {SoundNameEnum} from '../../shared/enums/sound-name.enum';
import {InitService} from '../../core/services/init.service';
import {AppRoutesEnum} from '../../app-routes.enum';

@Component({
	selector: 'app-question-page',
	standalone: false,
	templateUrl: './question-page.component.html',
	styleUrl: './question-page.component.scss'
})
export class QuestionPageComponent implements OnInit
{
	protected initService = inject(InitService);
	protected soundService = inject(SoundService);
	private imageLoadService = inject(ImageLoadService);
	
	protected readonly isShowingConfirmCancelDialog = signal<boolean>(false);
	
	protected readonly signalBtnCloseImageUrl = signal<string>('none');
	
	public questionIndex: number = 0;
	public maxQuestionNr: number = 3;
	
	public questions: Array<any> = [
		{
			question: 'Was ist ein Komponenten-Test?',
			answer1: 'Eine Softwaretestmethode, die einzelne, isolierte Bausteine einer Anwendung überprüft.',
			answer2: 'Wat wer bist du denn?',
			answer3: 'Tropfendes Schweinefleisch',
			rightAnswerIndex: 0
		},
		{
			question: 'Was ist ein Komponenten-Test? 2',
			answer1: 'Eine Softwaretestmethode, die einzelne, isolierte Bausteine einer Anwendung überprüft.',
			answer2: 'Wat wer bist du denn?',
			answer3: 'Tropfendes Schweinefleisch',
			rightAnswerIndex: 0
		},
		{
			question: 'Was ist ein Komponenten-Test? 3',
			answer1: 'Eine Softwaretestmethode, die einzelne, isolierte Bausteine einer Anwendung überprüft.',
			answer2: 'Wat wer bist du denn?',
			answer3: 'Tropfendes Schweinefleisch',
			rightAnswerIndex: 0
		}
	];
	
	protected currentQuestion: any = this.questions[0];
	
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
			// TODO reset game values
			this.initService.navigateToRoute(AppRoutesEnum.base).then()
		}
		else
		{
			this.isShowingConfirmCancelDialog.set(false);
		}
	}
	
	protected onClickAnswer1()
	{
		//
	}
	
	protected onClickAnswer2()
	{
		//
	}
	
	protected onClickAnswer3()
	{
		//
	}
}
