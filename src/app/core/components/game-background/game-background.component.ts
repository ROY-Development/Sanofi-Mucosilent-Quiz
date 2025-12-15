import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	inject,
	Input,
	OnChanges,
	OnInit,
	QueryList,
	signal,
	SimpleChanges,
	ViewChild,
	ViewChildren
} from '@angular/core';
import {BackgroundImageService} from '../../services/background-image.service';
import {BackgroundGradientService} from '../../services/background-gradient.service';
import {BackgroundAnimationService} from '../../services/background-animation.service';
import {Subscription} from 'rxjs';
import {BackgroundShapeService} from '../../services/background-shape.service';
import {UtilBrowser} from '../../../shared/utils/util-browser';
import {UtilTimeout} from '../../../shared/utils/util-timeout';

@Component({
	selector: 'app-game-background',
	templateUrl: './game-background.component.html',
	styleUrl: './game-background.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: false
})
export class GameBackgroundComponent implements OnInit, OnChanges
{
	protected backgroundShapeService = inject(BackgroundShapeService);
	protected backgroundImageService = inject(BackgroundImageService);
	protected backgroundGradientService = inject(BackgroundGradientService);
	protected backgroundAnimationService = inject(BackgroundAnimationService);
	private changeDetectorRef = inject(ChangeDetectorRef);
	
	@ViewChild('gameBackground') protected gameBackgroundRef!: ElementRef<HTMLDivElement>;
	@ViewChildren('animImage') animImageRefs!: QueryList<ElementRef<HTMLDivElement>>;
	
	@Input({required: true}) public pageHeight: number = 0;
	@Input({required: true}) public scaling: number = 1;
	
	public onInitCompleteSubscription: Subscription | null = null;
	
	protected readonly signalBottom = signal<number>(0);
	protected readonly signalIsIPhoneSafari = signal<boolean>(false);
	
	public ngOnInit(): void
	{
		this.onInitCompleteSubscription = this.backgroundAnimationService.onInitComplete
			.subscribe(() => { //(event: TranslationChangeEvent) => {
				this.changeDetectorRef.detectChanges();
				const imageList: Array<HTMLDivElement> = this.animImageRefs.map(image => image.nativeElement);
				
				UtilTimeout.setTimeout(() => {
					this.backgroundAnimationService.callTween(imageList);
				}, 200);
			});
		
		this.signalIsIPhoneSafari.set(UtilBrowser.isIPhoneSafari());
	}
	
	public ngOnChanges(changes: SimpleChanges): void
	{
		if (
			this.gameBackgroundRef &&
			this.scaling > 0 &&
			('pageHeight' in changes || 'scaling' in changes)
		)
		{
			const bottom: number = (this.pageHeight - window.innerHeight) / this.scaling;
			
			this.signalBottom.set(bottom);
		}
	}
}
