import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnDestroy,
	Output,
	signal,
	ViewChild
} from '@angular/core';
import {Point2DInterface} from '../../../games/interfaces/point-2D.interface';

@Component({
	selector: 'app-game-betting',
	templateUrl: './game-betting.component.html',
	styleUrl: './game-betting.component.scss',
	standalone: false
})
export class GameBettingComponent implements AfterViewInit, OnDestroy
{
	@ViewChild('board') protected board!: ElementRef<HTMLDivElement>;
	@ViewChild('betLine') protected betLine!: ElementRef<HTMLDivElement>;
	@ViewChild('betPoint') protected betPoint!: ElementRef<HTMLDivElement>;
	
	@Input({required: true}) public score: number = 0;
	
	@Output() protected readonly changeBetScore = new EventEmitter<number>();
	
	protected readonly signalBetPosX = signal<number>(0);
	protected readonly signalBetFactor = signal<number>(0);
	protected readonly signalBetScore = signal<number>(0);
	
	protected dragStartX: number | null = 0;
	
	private touchElement!: HTMLElement;
	
	public ngAfterViewInit(): void
	{
		this.init();
	}
	
	public ngOnDestroy(): void
	{
		this.removeEventListeners();
	}
	
	/* prepare events - important for removing all event listeners */
	private mouseDown = this.onMouseDown.bind(this);
	private mouseUp = this.onMouseUp.bind(this);
	private mouseMove = this.onMouseMove.bind(this);
	
	private touchElementTouchStart = this.onTouchElementTouchStart.bind(this);
	private touchStart = this.onTouchStart.bind(this);
	private touchMove = this.onTouchMove.bind(this);
	private touchEnd = this.onTouchEnd.bind(this);
	private touchCancel = this.onTouchCancel.bind(this);
	
	private addEventListeners(): void
	{
		// mouse events
		this.betPoint.nativeElement.addEventListener('mousedown', this.mouseDown);
		window.addEventListener('mouseup', this.mouseUp);
		window.addEventListener('mousemove', this.mouseMove);
		
		// touch events
		this.touchElement.addEventListener('touchstart', this.touchElementTouchStart, {passive: false});
		this.betPoint.nativeElement.addEventListener('touchstart', this.touchStart);
		window.addEventListener('touchmove', this.touchMove);
		window.addEventListener('touchend', this.touchEnd);
		window.addEventListener('touchcancel', this.touchCancel);
	}
	
	private removeEventListeners(): void
	{
		// mouse events
		this.betPoint?.nativeElement.removeEventListener('mousedown', this.mouseDown);
		window.removeEventListener('mouseup', this.mouseUp);
		window.removeEventListener('mousemove', this.mouseMove);
		
		// touch events
		this.touchElement?.removeEventListener('touchstart', this.touchElementTouchStart);
		this.betPoint?.nativeElement.removeEventListener('touchstart', this.touchStart);
		window.removeEventListener('touchmove', this.touchMove);
		window.removeEventListener('touchend', this.touchEnd);
		window.removeEventListener('touchcancel', this.touchCancel);
	}
	
	public init(): void
	{
		this.touchElement = this.board.nativeElement;
		
		this.addEventListeners();
	}
	
	protected onClickChangeBet(isIncrementing: boolean): void
	{
		if (isIncrementing)
		{
			if (this.signalBetScore() < this.score)
			{
				this.signalBetScore.set(this.signalBetScore() + 1);
			}
		}
		else
		{
			if (this.signalBetScore() > 0)
			{
				this.signalBetScore.set(this.signalBetScore() - 1);
			}
		}
		
		this.signalBetFactor.set(this.signalBetScore() / this.score);
		
		const maxPosX: number = this.betLine.nativeElement.clientWidth;
		this.signalBetPosX.set(this.signalBetFactor() * maxPosX);
		
		this.changeBetScore.emit(this.signalBetScore());
	}
	
	private onTouchElementTouchStart(event: TouchEvent): void
	{
		event.preventDefault();
	}
	
	private onMouseDown(event: MouseEvent): void
	{
		event.stopImmediatePropagation();
		event.preventDefault();
		
		const mousePos: Point2DInterface | null = this.getMousePos(event, 0);
		if (!mousePos)
		{
			return;
		}
		
		this.onDown(mousePos);
	}
	
	private onTouchStart(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		event.preventDefault();
		
		if (event.touches.length <= 0)
		{
			return;
		}
		
		const changedTouchesArray = Array.from(event.changedTouches);
		const mousePos: Point2DInterface | null = this.getMousePos(event, changedTouchesArray[0].identifier);
		if (!mousePos)
		{
			return;
		}
		
		this.onDown(mousePos);
	}
	
	private onDown(mousePos: Point2DInterface): void
	{
		this.dragStartX = mousePos.x - this.signalBetPosX() * this.getScale();
	}
	
	private onMouseUp(event: MouseEvent): void
	{
		event.stopImmediatePropagation();
		event.preventDefault();
		
		const mousePos: Point2DInterface | null = this.getMousePos(event, 0);
		if (!mousePos)
		{
			return;
		}
		
		this.onUp(mousePos);
	}
	
	private onTouchEnd(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		
		const changedTouchesArray = Array.from(event.changedTouches);
		const mousePos: Point2DInterface | null = this.getMousePos(event, changedTouchesArray[0].identifier);
		if (!mousePos)
		{
			return;
		}
		
		this.onUp(mousePos);
	}
	
	private onTouchCancel(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		event.preventDefault();
		
		this.dragStartX = null;
	}
	
	private onUp(mousePos: Point2DInterface): void
	{
		this.dragStartX = null;
		
		if (mousePos)
		{
			// do nothing more
		}
	}
	
	private onMouseMove(event: MouseEvent): void
	{
		event.stopImmediatePropagation();
		event.preventDefault();
		
		const mousePos: Point2DInterface | null = this.getMousePos(event, 0);
		if (!mousePos)
		{
			return;
		}
		
		this.onMove(mousePos);
	}
	
	private onTouchMove(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		event.preventDefault();
		
		const changedTouchesArray = Array.from(event.changedTouches);
		const mousePos: Point2DInterface | null = this.getMousePos(event, changedTouchesArray[0].identifier);
		if (!mousePos)
		{
			return;
		}
		
		this.onMove(mousePos);
	}
	
	private onMove(mousePos: Point2DInterface): void
	{
		if (this.dragStartX)
		{
			const maxPosX: number = this.betLine.nativeElement.clientWidth;
			let diffX: number = (mousePos.x - this.dragStartX) / this.getScale();
			
			diffX = Math.max(0, diffX);
			diffX = Math.min(maxPosX, diffX);
			
			this.signalBetPosX.set(diffX);
			this.signalBetFactor.set(diffX / maxPosX);
			this.signalBetScore.set(Math.round(this.signalBetFactor() * this.score));
			
			this.changeBetScore.emit(this.signalBetScore());
		}
	}
	
	private getMousePos(event: MouseEvent | TouchEvent, identifier: number): Point2DInterface | null
	{
		let clientX = null;
		let clientY = null;
		
		if (event instanceof MouseEvent)
		{
			clientX = event.clientX;
			clientY = event.clientY;
		}
		else if (event instanceof TouchEvent)
		{
			const changedTouchesArray = Array.from(event.changedTouches);
			for (const touch of changedTouchesArray)
			{
				if (touch.identifier === identifier)
				{
					clientX = touch.clientX;
					clientY = touch.clientY;
				}
			}
		}
		
		if (clientX && clientY)
		{
			return {x: clientX, y: clientY};
		}
		
		return null;
	}
	
	private getScale(): number
	{
		return this.board.nativeElement.getBoundingClientRect().width / this.board.nativeElement.clientWidth;
	}
}
