import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	ContentChild,
	ElementRef,
	inject,
	Input,
	OnChanges,
	OnDestroy,
	signal,
	SimpleChanges,
	TemplateRef,
	ViewChild
} from '@angular/core';
import {DirectivesModule} from '../../directives/directives.module';
import {PipesModule} from '../../pipes/pipes.module';
import {NgTemplateOutlet} from '@angular/common';
import {SplitScreenAnimationTypeEnum} from '../../enums/split-screen-animation-type.enum';
import {AniSplitScreenTitleService} from './ani-split-screen-title.service';
import {Subscription} from 'rxjs';
import {UtilTimeout} from '../../utils/util-timeout';

@Component({
	selector: 'app-ani-split-screen-title',
	templateUrl: './ani-split-screen-title.component.html',
	styleUrl: './ani-split-screen-title.component.scss',
	standalone: true,
	imports: [
		DirectivesModule,
		PipesModule,
		NgTemplateOutlet
	]
})
export class AniSplitScreenTitleComponent implements AfterViewInit, OnChanges, OnDestroy
{
	@ContentChild(TemplateRef) contentTemplate!: TemplateRef<any>;
	
	@ViewChild('splitHalfFirst') protected splitHalfFirst!: ElementRef<HTMLDivElement>;
	
	@Input({required: true}) backgroundColor: string = '#d4d4d442';
	@Input({required: false}) public backgroundImageUrl: string = 'none';
	@Input({required: false}) splitScreenAnimationType: SplitScreenAnimationTypeEnum = SplitScreenAnimationTypeEnum.diagonalLeftToRight;
	
	public isDebug: boolean = false;
	
	private aniSplitScreenTitleService = inject(AniSplitScreenTitleService);
	private changeDetectorRef = inject(ChangeDetectorRef);
	
	protected readonly signalIsOpen = signal<boolean>(false);
	protected readonly signalHasTransition = signal<boolean>(false);
	protected readonly signalSplitScreenAnimationClass = signal<string>(SplitScreenAnimationTypeEnum[this.splitScreenAnimationType]);
	
	private transitionEnd = this.onTransitionEnd.bind(this);
	
	private eventSubscription: Subscription | null = null;
	private restartTimeoutSubscription: Subscription | null = null;
	
	public get isOpen(): boolean
	{
		return this.signalIsOpen();
	}
	
	public ngAfterViewInit(): void
	{
		this.splitHalfFirst.nativeElement.addEventListener('transitionend', this.transitionEnd);
		
		this.signalSplitScreenAnimationClass.set(SplitScreenAnimationTypeEnum[this.splitScreenAnimationType]);
		
		this.eventSubscription = this.aniSplitScreenTitleService.eventEmitter.subscribe(() => {
			// close and show it directly
			this.signalHasTransition.set(false);
			this.signalIsOpen.set(false);
			this.restartTimeoutSubscription?.unsubscribe();
			this.changeDetectorRef.detectChanges();
			
			// open it after some time
			this.restartTimeoutSubscription = UtilTimeout.setTimeout(
				() => {
					this.restartTimeoutSubscription = null;
					this.toggle();
				}, 1000);
		});
	}
	
	public ngOnChanges(changes: SimpleChanges): void
	{
		if ('splitScreenAnimationType' in changes)
		{
			this.signalSplitScreenAnimationClass.set(SplitScreenAnimationTypeEnum[changes['splitScreenAnimationType'].currentValue]);
		}
	}
	
	public ngOnDestroy(): void
	{
		if (this.splitHalfFirst)
		{
			this.splitHalfFirst.nativeElement.removeEventListener('transitionend', this.transitionEnd);
		}
		
		if (this.eventSubscription)
		{
			this.eventSubscription.unsubscribe();
			this.eventSubscription = null;
		}
		
		if (this.restartTimeoutSubscription)
		{
			this.restartTimeoutSubscription.unsubscribe();
			this.restartTimeoutSubscription = null;
		}
	}
	
	public toggle(): void
	{
		this.signalIsOpen.set(!this.signalIsOpen());
		this.signalHasTransition.set(true);
	}
	
	private onTransitionEnd(event: TransitionEvent): void
	{
		if (event.propertyName === 'transform')
		{
			this.signalHasTransition.set(false);
		}
	}
}
