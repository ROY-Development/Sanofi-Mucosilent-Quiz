import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	inject,
	Input,
	NgZone,
	OnChanges,
	OnDestroy,
	Output,
	SimpleChanges,
	ViewChild
} from '@angular/core';
import {Point2DInterface} from '../../../games/interfaces/point-2D.interface';
import {UtilTimeout} from '../../utils/util-timeout';
import {AppLoopService} from '../../../core/services/app-loop.service';
import {AniExplosionComponent} from '../ani-explosion/ani-explosion.component';

type ScratchDirection = {
	dx: number;              // delta x (px)
	dy: number;              // delta y (px)
	angleDeg: number;        // 0° = rechts, 90° = unten (Canvas-Koordinaten)
	speedPxPerSec: number;   // px/s
};

@Component({
	selector: 'app-scratch-free',
	standalone: false,
	templateUrl: './scratch-free.component.html',
	styleUrl: './scratch-free.component.scss'
})
export class ScratchFreeComponent implements AfterViewInit, OnChanges, OnDestroy
{
	private static readonly CHECK_TIMEOUT_MS: number = 20;
	private static readonly SCRATCH_FINISH_FACTOR: number = 0.8;
	
	// private changeDetectorRef = inject(ChangeDetectorRef);
	private ngZone = inject(NgZone);
	
	@ViewChild('canvas') public canvas?: ElementRef<HTMLCanvasElement>;
	@ViewChild("aniExplosion") aniExplosion!: AniExplosionComponent;
	
	@Input({required: false}) public enabled: boolean = true;
	@Input({required: false}) public widthPx: number = 300;
	@Input({required: false}) public heightPx: number = 200;
	@Input({required: false}) public borderRadius: number = 0;
	@Input({required: false}) public scratchRadius: number = 20;
	@Input({required: false}) public scratchFreeBg: HTMLImageElement | null = null;
	
	@Output() public readonly scratch = new EventEmitter<number>();
	@Output() public readonly scratchFinished = new EventEmitter<void>();
	@Output() public readonly scratchDirection = new EventEmitter<ScratchDirection>();
	
	private ctx?: CanvasRenderingContext2D;
	
	protected freePercent: number = 0;
	protected isFlyAway: boolean = false;
	protected isDrawing: boolean = false;
	
	/* prepare events - important for removing all event listeners */
	private mouseEnter = this.onMouseEnter.bind(this);
	private mouseDown = this.onMouseDown.bind(this);
	private mouseUp = this.onMouseUp.bind(this);
	private mouseMove = this.onMouseMove.bind(this);
	
	//private touchElementTouchStart = this.onTouchElementTouchStart.bind(this);
	private touchStart = this.onTouchStart.bind(this);
	private touchMove = this.onTouchMove.bind(this);
	private touchEnd = this.onTouchEnd.bind(this);
	private touchCancel = this.onTouchCancel.bind(this);
	
	private diffBoardX: number = 0;
	private diffBoardY: number = 0;
	
	//@ViewChild('touchElement') protected touchElement!: ElementRef<HTMLElement>;
	//@ViewChild('scratchFreeText') protected scratchFreeText!: ElementRef<HTMLElement>;
	//@ViewChild('scratchFreeText2') protected scratchFreeText2!: ElementRef<HTMLElement>;
	
	private checkTimeout: number = 0;
	private mousePos: Point2DInterface | null = null;
	
	// Richtungsermittlung (letzte Position + geglättete Delta-Werte)
	private lastPointerPos: Point2DInterface | null = null;
	private lastPointerTsMs: number | null = null;
	private smoothDx: number = 0;
	private smoothDy: number = 0;
	private lastScratchDirection: ScratchDirection | null = null;
	
	private readonly appLoopService: AppLoopService = new AppLoopService(this.loop.bind(this));
	
	constructor()
	{
		this.appLoopService.stop();
		this.appLoopService.setRuntime(0);
		this.appLoopService.init('ScratchFreeComponent');
	}
	
	public ngAfterViewInit(): void
	{
		if (this.canvas)
		{
			const canvas: HTMLCanvasElement | undefined = this.canvas?.nativeElement;
			canvas.width = this.widthPx;
			canvas.height = this.heightPx;
			
			this.ctx = this.canvas.nativeElement.getContext('2d', {willReadFrequently: true}) as CanvasRenderingContext2D;
			
			if (this.scratchFreeBg)
			{
				this.ctx.clearRect(0, 0, this.widthPx, this.heightPx);
				this.ctx.drawImage(this.scratchFreeBg, 0, 0, this.widthPx, this.heightPx);
			}
			else
			{
				this.ctx.fillStyle = 'gray';
				this.ctx.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
			}
			
			// composite mode for scratching out
			this.ctx.globalCompositeOperation = 'destination-out';
			
			this.addEventListeners();
			this.appLoopService.start();
		}
	}
	
	public ngOnChanges(changes: SimpleChanges): void
	{
		if (this.ctx && 'scratchFreeBg' in changes && this.scratchFreeBg)
		{
			UtilTimeout.setTimeout(() => {
				this.ctx!.globalCompositeOperation = 'color';
				
				this.ctx!.drawImage(this.scratchFreeBg!, 0, 0, this.widthPx, this.heightPx);
				
				this.ctx!.globalCompositeOperation = 'destination-out';
			}, 10);
		}
	}
	
	public ngOnDestroy(): void
	{
		this.appLoopService.stop();
		this.removeEventListeners();
	}
	
	private addEventListeners(): void
	{
		if (!this.canvas)
		{
			return;
		}
		
		// mouse events
		this.canvas.nativeElement.addEventListener('mouseenter', this.mouseEnter);
		this.canvas.nativeElement.addEventListener('mousedown', this.mouseDown);
		this.canvas.nativeElement.addEventListener('mouseup', this.mouseUp);
		this.canvas.nativeElement.addEventListener('mousemove', this.mouseMove);
		this.canvas.nativeElement.addEventListener('mouseleave', this.mouseUp);
		
		// touch events
		//this.canvas.nativeElement.addEventListener('touchstart', this.touchElementTouchStart, {passive: false});
		this.canvas.nativeElement.addEventListener('touchstart', this.touchStart);
		this.canvas.nativeElement.addEventListener('touchmove', this.touchMove);
		this.canvas.nativeElement.addEventListener('touchend', this.touchEnd);
		this.canvas.nativeElement.addEventListener('touchcancel', this.touchCancel);
	}
	
	private removeEventListeners(): void
	{
		if (!this.canvas)
		{
			return;
		}
		
		// mouse events
		this.canvas.nativeElement.removeEventListener('mouseenter', this.mouseEnter);
		this.canvas.nativeElement.removeEventListener('mousedown', this.mouseDown);
		this.canvas.nativeElement.removeEventListener('mouseup', this.mouseUp);
		this.canvas.nativeElement.removeEventListener('mousemove', this.mouseMove);
		this.canvas.nativeElement.removeEventListener('mouseleave', this.mouseUp);
		
		// touch events
		//this.canvas.nativeElement.removeEventListener('touchstart', this.touchElementTouchStart);
		this.canvas.nativeElement.removeEventListener('touchstart', this.touchStart);
		this.canvas.nativeElement.removeEventListener('touchmove', this.touchMove);
		this.canvas.nativeElement.removeEventListener('touchend', this.touchEnd);
		this.canvas.nativeElement.removeEventListener('touchcancel', this.touchCancel);
	}
	
	/*private onTouchElementTouchStart(event: TouchEvent): void
	{
		event.preventDefault();
	}*/
	
	private onMouseEnter(event: MouseEvent): void
	{
		const elementFromPoint = document.elementFromPoint(event.screenX, event.screenY);
		
		if (
			this.canvas?.nativeElement !== elementFromPoint &&
			this.lastPointerPos === null &&
			event.buttons === 1
		)
		{
			this.onMouseDown(event);
		}
	}
	
	private onMouseDown(event: MouseEvent): void
	{
		event.stopImmediatePropagation();
		
		this.isDrawing = true;
		
		// Richtungsmessung neu starten
		this.lastPointerPos = null;
		this.lastPointerTsMs = null;
		this.smoothDx = 0;
		this.smoothDy = 0;
		this.lastScratchDirection = null;
	}
	
	private onMouseMove(event: MouseEvent): void
	{
		event.stopImmediatePropagation();
		
		this.draw(event);
	}
	
	private onMouseUp(event: MouseEvent): void
	{
		this.isDrawing = false;
		
		// optional: Messung beenden
		this.lastPointerPos = null;
		this.lastPointerTsMs = null;
		
		event.stopImmediatePropagation();
	}
	
	private onTouchStart(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		
		if (event.touches.length <= 0)
		{
			return;
		}
		
		this.isDrawing = true;
		
		// Richtungsmessung neu starten
		this.lastPointerPos = null;
		this.lastPointerTsMs = null;
		this.smoothDx = 0;
		this.smoothDy = 0;
		this.lastScratchDirection = null;
	}
	
	private onTouchMove(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		
		const touches = Array.from(event.changedTouches);
		const touch: Touch = touches.find(tt => tt.identifier === 0) ?? touches[0];
		
		const elementFromPoint = document.elementFromPoint(touch.pageX, touch.pageY);
		
		if (this.canvas?.nativeElement !== elementFromPoint)
		{
			this.onTouchEnd(event);
		}
		else if (this.lastPointerPos === null)
		{
			this.onTouchStart(event);
		}
		
		this.ngZone.runOutsideAngular(() => {
			this.draw(event);
		});
	}
	
	private onTouchEnd(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		
		this.isDrawing = false;
		
		this.lastPointerPos = null;
		this.lastPointerTsMs = null;
	}
	
	private onTouchCancel(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		
		this.isDrawing = false;
		
		this.lastPointerPos = null;
		this.lastPointerTsMs = null;
	}
	
	// Best version also for iPad 2025-12-16
	private getMousePos(event: MouseEvent | TouchEvent, identifier: number): Point2DInterface | null
	{
		const rect = this.canvas!.nativeElement.getBoundingClientRect();
		
		let clientX: number | null = null;
		let clientY: number | null = null;
		
		// Robust: Touch über Feature-Detection statt instanceof
		if ('changedTouches' in event)
		{
			const touches = Array.from(event.changedTouches);
			const t = touches.find(tt => tt.identifier === identifier) ?? touches[0];
			
			if (t)
			{
				clientX = t.clientX;
				clientY = t.clientY;
			}
		}
		else
		{
			clientX = event.clientX;
			clientY = event.clientY;
		}
		
		// Wichtig: 0 ist gültig → nicht mit "if (clientX && clientY)" prüfen!
		if (clientX !== null && clientY !== null)
		{
			return {
				x: -this.diffBoardX + (clientX - rect.left) * this.canvas!.nativeElement.width / rect.width,
				y: -this.diffBoardY + (clientY - rect.top) * this.canvas!.nativeElement.height / rect.height
			};
		}
		
		return null;
	}
	
	/*private getTouchPosModel(identifier: number): TouchPosModel | null
	{
		for (const rect of this.rects)
		{
			const value = rect.getTouchPosModel(identifier);
			if (value)
			{
				return value;
			}
		}
		
		return null;
	}*/
	
	private draw(event: any): void
	{
		if (!this.enabled || !this.isDrawing || !this.ctx || !this.canvas)
		{
			return;
		}
		event.preventDefault();
		//const rect = this.canvas.nativeElement.getBoundingClientRect();
		//const x = (event.clientX || event.touches[0].clientX) - rect.left;
		//const y = (event.clientY || event.touches[0].clientY) - rect.top;
		
		this.mousePos = this.getMousePos(event, 0);
		
		if (!this.mousePos)
		{
			return;
		}
		
		// -------- calculate direction --------
		const nowTsMs: number = typeof event?.timeStamp === 'number' ? event.timeStamp : performance.now();
		
		if (this.lastPointerPos && this.lastPointerTsMs != null)
		{
			const rawDx = this.mousePos.x - this.lastPointerPos.x;
			const rawDy = this.mousePos.y - this.lastPointerPos.y;
			
			const dtMs = Math.max(1, nowTsMs - this.lastPointerTsMs);
			const dtSec = dtMs / 1000;
			
			// leichtes Smoothing gegen Zittern
			const alpha = 0.35; // 0..1 (höher = weniger Glättung, schneller)
			this.smoothDx = this.smoothDx + (rawDx - this.smoothDx) * alpha;
			this.smoothDy = this.smoothDy + (rawDy - this.smoothDy) * alpha;
			
			const dist = Math.hypot(this.smoothDx, this.smoothDy);
			if (dist > 0.1)
			{
				const angleRad = Math.atan2(this.smoothDy, this.smoothDx);
				const angleDeg = (angleRad * 180) / Math.PI;
				
				const dir: ScratchDirection = {
					dx: this.smoothDx,
					dy: this.smoothDy,
					angleDeg,
					speedPxPerSec: dist / dtSec
				};
				
				this.lastScratchDirection = dir;
				this.scratchDirection.emit(dir);
			}
		}
		
		this.lastPointerPos = {x: this.mousePos.x, y: this.mousePos.y};
		this.lastPointerTsMs = nowTsMs;
		// -------- END calculate direction --------
		
		this.ctx.fillStyle = '#fff5';
		this.ctx.beginPath();
		this.ctx.arc(this.mousePos.x, this.mousePos.y, this.scratchRadius, 0, Math.PI * 2);
		this.ctx.fill();
		
		//	this.changeDetectorRef.detectChanges();
		
		if (this.checkTimeout <= 0)
		{
			this.checkTimeout = ScratchFreeComponent.CHECK_TIMEOUT_MS;
		}
	}
	
	private updateScratchFactor(): void
	{
		const imageData = this.ctx!.getImageData(0, 0, this.widthPx, this.heightPx);
		const data = imageData.data;
		const totalPixels = data.length / 4;
		let transparent = 0;
		for (let i = 3; i < data.length; i += 4)
		{
			if (data[i] === 255)
			{
				transparent++;
			}
		}
		const factor = 1 - transparent / totalPixels;
		const percent = factor * 100;
		
		this.freePercent = Math.round(percent * 10) / 10;
		
		if (!this.isFlyAway && this.mousePos)
		{
			const collision: boolean = this.mousePos.x >= 0 &&
				this.mousePos.x <= this.widthPx &&
				this.mousePos.y >= 0 &&
				this.mousePos.y <= this.heightPx;
			
			if (collision)
			{
				this.scratch.emit(factor);
			}
		}
		
		if (factor > ScratchFreeComponent.SCRATCH_FINISH_FACTOR)
		{
			//ctx.fillStyle = '#fff';
			//ctx.fillRect(0, 0, canvas.width, canvas.height);
			//this.canvas.nativeElement.classList.add('canvas-fly-away');
			
			this.isFlyAway = true;
			this.scratchFinished.emit();
		}
		
		//	this.changeDetectorRef.detectChanges();
	}
	
	private loop(delta: number): void
	{
		if (this.checkTimeout > 0)
		{
			this.checkTimeout -= delta;
			if (this.checkTimeout <= 0)
			{
				this.checkTimeout = 0;
				
				if (!this.enabled)
				{
					return;
				}
				
				this.updateScratchFactor();
				
				if (!this.isFlyAway && this.mousePos && this.canvas)
				{
					const x: number = this.canvas.nativeElement.offsetLeft + this.mousePos.x;
					const y: number = this.canvas.nativeElement.offsetTop + this.mousePos.y;
					const collision: boolean = this.mousePos.x >= 0 &&
						this.mousePos.x <= this.widthPx &&
						this.mousePos.y >= 0 &&
						this.mousePos.y <= this.heightPx;
					
					if (collision)
					{
						this.aniExplosion.callExplosion(
							x, y, 2,
							this.lastScratchDirection?.angleDeg,
							60,
							10
						);
						
						/*if (Math.round(Math.random() * 2) === 0)
							this.aniExplosion.callExplosion(
								x, y, 5,
								this.lastScratchDirection?.angleDeg,
								60,
								10
							);*/
					}
				}
			}
		}
	}
}
