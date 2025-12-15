import {Component, EventEmitter, inject, Input, OnInit, Output, signal} from '@angular/core';
import {SoundService} from '../../services/sound.service';
import {SoundNameEnum} from '../../../shared/enums/sound-name.enum';
import {TopicQuestionResultModel} from '../../../shared/models/topic-question-result.model';
import {NativeTranslateService} from '../../services/native-translate.service';
import {ImageLoadService} from '../../services/image-load.service';

@Component({
	selector: 'app-modal-task-solved',
	templateUrl: './modal-task-solved.component.html',
	styleUrls: ['./modal-task-solved.component.scss'],
	standalone: false
})
export class ModalTaskSolvedComponent implements OnInit
{
	protected nativeTranslateService = inject(NativeTranslateService);
	private soundService = inject(SoundService);
	private imageLoadService = inject(ImageLoadService);
	
	@Input() public runtime: number = 0;
	@Input() public topicQuestionResultList: Array<TopicQuestionResultModel> = [];
	//@Input() public taskTokens: number = 0;
	//@Input() public timeBonusTokens: number = 0;
	@Input() public roundScore: number = 0;
	@Input() public totalScore: number = 0;
	@Input({required: true}) public wasLastGame: boolean = false;
	
	@Output() public readonly cancelDialog = new EventEmitter<boolean>();
	
	public readonly signalStarImageUrl = signal<string>('none');
	
	public ngOnInit(): void
	{
		const image: HTMLImageElement | null = this.imageLoadService.getImage('starImage');
		if (image)
		{
			this.signalStarImageUrl.set(`url('${image.src}')`);
		}
	}
	
	public onClickClose(isConfirmed: boolean): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		this.cancelDialog.emit(isConfirmed);
	}
}
