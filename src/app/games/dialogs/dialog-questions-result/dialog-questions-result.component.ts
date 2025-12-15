import {Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal} from '@angular/core';
import {GameService as GlobalGameService} from '../../../core/services/game.service';
import {NativeTranslateService} from '../../../core/services/native-translate.service';
import {InitService} from '../../../core/services/init.service';
import {SoundService} from '../../../core/services/sound.service';
import {ImageLoadService} from '../../../core/services/image-load.service';
import {TopicQuestionResultModel} from '../../../shared/models/topic-question-result.model';
import {SoundNameEnum} from '../../../shared/enums/sound-name.enum';

@Component({
	selector: 'app-dialog-questions-result',
	templateUrl: './dialog-questions-result.component.html',
	styleUrl: './dialog-questions-result.component.scss',
	standalone: false
})
export class DialogQuestionsResultComponent implements OnInit, OnDestroy
{
	protected globalGameService = inject(GlobalGameService);
	protected nativeTranslateService = inject(NativeTranslateService);
	protected initService = inject(InitService);
	private soundService = inject(SoundService);
	private imageLoadService = inject(ImageLoadService);
	
	@Input({required: true}) public runtime!: number;
	@Input({required: true}) public questionResultList!: Array<TopicQuestionResultModel>;
	
	@Output() public readonly cancelDialog = new EventEmitter<boolean>();
	
	protected readonly signalBtnCloseImageUrl = signal<string>('none');
	protected readonly signalStarImageUrl = signal<string>('none');
	protected readonly signalIconReviewCorrectImageUrl = signal<string>('none');
	protected readonly signalIconReviewWrongImageUrl = signal<string>('none');
	public readonly signalBtnQuestionImageUrl = signal<string>('none');
	
	public ngOnInit(): void
	{
		let image: HTMLImageElement | null = this.imageLoadService.getImage('btnClose');
		if (image)
		{
			this.signalBtnCloseImageUrl.set(`url('${image.src}')`);
		}
		
		image = this.imageLoadService.getImage('starImage');
		if (image)
		{
			this.signalStarImageUrl.set(`url('${image.src}')`);
		}
		
		image = this.imageLoadService.getImage('iconReviewCorrect');
		if (image)
		{
			this.signalIconReviewCorrectImageUrl.set(`url('${image.src}')`);
		}
		
		image = this.imageLoadService.getImage('iconReviewWrong');
		if (image)
		{
			this.signalIconReviewWrongImageUrl.set(`url('${image.src}')`);
		}
		
		image = this.imageLoadService.getImage('swipeYesNoBtnQuestionImage');
		if (image)
		{
			this.signalBtnQuestionImageUrl.set(`url('${image.src}')`);
		}
	}
	
	public ngOnDestroy(): void
	{
		for (const topicQuestionResult of this.questionResultList)
		{
			topicQuestionResult.isFeedbackVisible = false;
		}
	}
	
	protected onClickClose(isConfirmed: boolean): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		this.soundService.playSound(SoundNameEnum.modalFadeOut, true);
		this.cancelDialog.emit(isConfirmed);
	}
	
	protected clickShowFeedback(topicQuestionResult: TopicQuestionResultModel)
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		topicQuestionResult.isFeedbackVisible = !topicQuestionResult.isFeedbackVisible;
	}
}