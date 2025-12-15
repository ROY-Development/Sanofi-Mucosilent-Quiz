import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	HostListener,
	inject,
	OnDestroy,
	Output
} from '@angular/core';
import {StillThereService} from '../../services/still-there.service';
import {ScreenPartSideEnum} from '../../../shared/enums/screen-part-side.enum';
import {InitService} from '../../services/init.service';

@Component({
	selector: 'app-still-there',
	templateUrl: './still-there.component.html',
	styleUrls: ['./still-there.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: false
})
export class StillThereComponent implements AfterViewInit, OnDestroy
{
	protected initService = inject(InitService);
	protected stillThereService = inject(StillThereService);
	
	@Output() public readonly away = new EventEmitter<void>();
	
	protected readonly ScreenPartSideEnum = ScreenPartSideEnum;
	
	public isDebug: boolean = false;
	
	private timerInterval: number = -1;
	
	public ngAfterViewInit(): void
	{
		this.timerInterval = window.setInterval(() => {
			if (this.stillThereService.signalTimerSeconds() > 0)
			{
				this.stillThereService.decrementTimer();
			}
			
			if (this.stillThereService.signalTimerSeconds() <= 0)
			{
				this.away.emit();
			}
		}, 1000);
	}
	
	public ngOnDestroy(): void
	{
		if (this.timerInterval !== -1)
		{
			window.clearInterval(this.timerInterval);
			this.timerInterval = -1;
		}
	}
	
	@HostListener('window:mousedown', ['$event'])
	@HostListener('window:click', ['$event'])
	@HostListener('window:touchstart', ['$event'])
	public onTouchScreen(event: TouchEvent | MouseEvent): void
	{
		if (event)
		{
			//
		}
		
		if (this.stillThereService.signalTimerSeconds() > this.initService.appConfig.stillThereLastSeconds)
		{
			this.stillThereService.resetTimer();
		}
	}
	
	public onTouchBlockShape(): void
	{
		this.stillThereService.resetTimer();
	}
	
	/*public onClickBtn(ev: MouseEvent | PointerEvent, isStillThere: boolean): void
	{
		ev.stopImmediatePropagation();
		
		if (isStillThere)
		{
			this.stillThereService.resetTimer();
		}
		else
		{
			this.away.emit();
		}
	}*/
}
