import {Component, EventEmitter, inject, Input, OnInit, Output, signal} from '@angular/core';
import {TopicQuestionResultModel} from '../../../shared/models/topic-question-result.model';
import {NativeTranslateService} from '../../../core/services/native-translate.service';
import {SoundService} from '../../../core/services/sound.service';
import {ImageLoadService} from '../../../core/services/image-load.service';
import {SoundNameEnum} from '../../../shared/enums/sound-name.enum';
import {InitService} from '../../../core/services/init.service';
import {GameService as GlobalGameService} from '../../../core/services/game.service';

@Component({
	selector: 'app-dialog-task-solved',
	templateUrl: './dialog-task-solved.component.html',
	styleUrl: './dialog-task-solved.component.scss',
	standalone: false
})
export class DialogTaskSolvedComponent implements OnInit
{
	protected globalGameService = inject(GlobalGameService);
	protected nativeTranslateService = inject(NativeTranslateService);
	protected initService = inject(InitService);
	private soundService = inject(SoundService);
	private imageLoadService = inject(ImageLoadService);
	
	@Input({required: true}) public runtime!: number;
	@Input({required: true}) public topicQuestionResultList!: Array<TopicQuestionResultModel>;
	@Input({required: true}) public roundScore!: number;
	@Input({required: true}) public totalScore!: number;
	@Input({required: true}) public wasLastGame!: boolean;
	@Input({required: true}) public showAllQuizQuestions!: boolean;
	
	@Output() public readonly cancelDialog = new EventEmitter<boolean>();
	
	protected readonly signalStarImageUrl = signal<string>('none');
	protected readonly signalBtnCorrectImageUrl = signal<string>('none');
	protected readonly signalBtnNotCorrectImageUrl = signal<string>('none');
	
	protected readonly onScoreArrive = (): void => {
		this.soundService.playSound(SoundNameEnum.scoreArrive, true);
	};
	
	public ngOnInit(): void
	{
		let image: HTMLImageElement | null = this.imageLoadService.getImage('starImage');
		if (image)
		{
			this.signalStarImageUrl.set(`url('${image.src}')`);
		}
		
		image = this.imageLoadService.getImage('swipeYesNoBtnCorrectImage');
		if (image)
		{
			this.signalBtnCorrectImageUrl.set(`url('${image.src}')`);
		}
		
		image = this.imageLoadService.getImage('swipeYesNoBtnNotCorrectImage');
		if (image)
		{
			this.signalBtnNotCorrectImageUrl.set(`url('${image.src}')`);
		}
	}
	
	protected onClickClose(isConfirmed: boolean): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		this.soundService.playSound(SoundNameEnum.modalFadeOut, true);
		this.cancelDialog.emit(isConfirmed);
	}
}
