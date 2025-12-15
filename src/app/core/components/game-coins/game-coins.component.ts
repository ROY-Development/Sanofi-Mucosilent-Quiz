import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	inject,
	OnDestroy,
	OnInit,
	QueryList,
	ViewChildren
} from '@angular/core';
import {GameCoinsService} from '../../services/game-coins.service';
import {Subscription} from 'rxjs';

@Component({
	selector: 'app-game-coins',
	templateUrl: './game-coins.component.html',
	styleUrl: './game-coins.component.scss',
	changeDetection: ChangeDetectionStrategy.Default,
	standalone: false
})
export class GameCoinsComponent implements OnInit, OnDestroy
{
	protected gameCoinsService = inject(GameCoinsService);
	private changeDetectorRef = inject(ChangeDetectorRef);
	
	@ViewChildren('coin') coinRefs!: QueryList<ElementRef<HTMLDivElement>>;
	
	// private readonly appLoopService: AppLoopService = new AppLoopService(this.loop.bind(this));
	
	public onInitCompleteSubscription: Subscription | null = null;
	public onAnimationCompleteSubscription: Subscription | null = null;
	
	public ngOnInit(): void
	{
		this.onInitCompleteSubscription = this.gameCoinsService.onInitComplete
			.subscribe(() => { //(event: TranslationChangeEvent) => {
				this.changeDetectorRef.detectChanges();
				
				const coinList: Array<HTMLDivElement> = this.coinRefs.map(coin => coin.nativeElement)
				
				this.gameCoinsService.callTween(coinList);
			});
		
		this.onAnimationCompleteSubscription = this.gameCoinsService.onAnimationComplete
			.subscribe(() => { //(event: TranslationChangeEvent) => {
				this.changeDetectorRef.detectChanges();
			});
	}
	
	public ngOnDestroy(): void
	{
		// this.appLoopService.stop();
		if (this.onInitCompleteSubscription)
		{
			this.onInitCompleteSubscription.unsubscribe();
			this.onInitCompleteSubscription = null;
		}
		
		if (this.onAnimationCompleteSubscription)
		{
			this.onAnimationCompleteSubscription.unsubscribe();
			this.onAnimationCompleteSubscription = null;
		}
	}
	
	/*
	private loop(delta: number): void
	{
		if (!this.isRunning)
		{
			return;
		}
		
		for (let i = 0, n = this.coins.length; i < n; ++i)
		{
		
		}
	}*/
}
