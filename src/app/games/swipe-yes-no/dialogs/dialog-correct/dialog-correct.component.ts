import {
	Component,
	ElementRef,
	EventEmitter,
	inject,
	Input,
	OnDestroy,
	OnInit,
	Output,
	signal,
	ViewChild
} from '@angular/core';
import {GameStateEnum} from '../../enums/game-state.enum';
import {AppConfig} from '../../../../app.config';
import {SwipeYesNoService} from '../../services/swipe-yes-no.service';
import {QuestionCardModel} from '../../models/question-card.model';
import {ImageLoadService} from '../../../../core/services/image-load.service';
import {InitService} from '../../../../core/services/init.service';
import {GameService as GlobalGameService} from '../../../../core/services/game.service';
import {Subscription} from 'rxjs';

@Component({
	selector: 'app-dialog-correct',
	templateUrl: './dialog-correct.component.html',
	styleUrl: './dialog-correct.component.scss',
	standalone: false
})
export class DialogCorrectComponent implements OnInit, OnDestroy
{
	protected swipeYesNoService = inject(SwipeYesNoService);
	protected initService = inject(InitService);
	protected globalGameService = inject(GlobalGameService);
	private imageLoadService = inject(ImageLoadService);
	
	@ViewChild('comboContainer') public comboContainerRef?: ElementRef<HTMLDivElement>;
	@ViewChild('superfastContainer') public superfastContainerRef?: ElementRef<HTMLDivElement>;
	
	@Input({required: true}) public gameState: GameStateEnum = GameStateEnum.init;
	@Input({required: true}) public currentQuestion: QuestionCardModel | null = null;
	@Input({required: true}) public correctComboCount!: number;
	
	@Output() public readonly clickShowAnswer = new EventEmitter<void>();
	
	public readonly signalGreatImageUrl = signal<string>('none');
	public readonly signalBtnQuestionImageUrl = signal<string>('none');
	
	private rerenderSubscription: Subscription | null = null;
	
	protected readonly AppConfig = AppConfig;
	protected readonly GameStateEnum = GameStateEnum;
	
	public ngOnInit(): void
	{
		let image: HTMLImageElement | null;
		
		image = this.imageLoadService.getImage('swipeYesNoGreatImage');
		if (image)
		{
			this.signalGreatImageUrl.set(image.src);
		}
		
		image = this.imageLoadService.getImage('swipeYesNoBtnQuestionImage');
		if (image)
		{
			this.signalBtnQuestionImageUrl.set(`url('${image.src}')`);
		}
		
		this.rerenderSubscription = this.swipeYesNoService.rerenderEmitter.subscribe((editorKey: string) => {
			if (editorKey === 'correct')
			{
				image = this.imageLoadService.getImage('swipeYesNoGreatImage');
				if (image)
				{
					this.signalGreatImageUrl.set(image.src);
				}
			}
		});
	}
	
	public ngOnDestroy(): void
	{
		if (this.rerenderSubscription)
		{
			this.rerenderSubscription.unsubscribe();
			this.rerenderSubscription = null;
		}
	}
}
