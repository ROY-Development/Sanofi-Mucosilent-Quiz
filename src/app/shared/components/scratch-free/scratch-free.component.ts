import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, ViewChild} from '@angular/core';
import {Point2DInterface} from '../../../games/interfaces/point-2D.interface';

@Component({
	selector: 'app-scratch-free',
	standalone: false,
	templateUrl: './scratch-free.component.html',
	styleUrl: './scratch-free.component.scss'
})
export class ScratchFreeComponent implements AfterViewInit, OnDestroy
{
	private changeDetectorRef = inject(ChangeDetectorRef);
	
	@ViewChild('canvas') public canvas?: ElementRef<HTMLCanvasElement>;
	
	private ctx?: CanvasRenderingContext2D;
	
	protected freePercent: number = 0;
	protected isFlyAway: boolean = false;
	
	isDrawing = false;
	
	/* prepare events - important for removing all event listeners */
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
	
	public ngAfterViewInit(): void
	{
		if (this.canvas)
		{
			this.ctx = this.canvas.nativeElement.getContext("2d") as CanvasRenderingContext2D;
			
			this.ctx.fillStyle = 'gray';
			this.ctx.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
			
			// composite mode for scratching out
			this.ctx.globalCompositeOperation = 'destination-out';
			
			this.addEventListeners();
		}
	}
	
	public ngOnDestroy(): void
	{
		this.removeEventListeners();
	}
	
	private addEventListeners(): void
	{
		if (!this.canvas)
		{
			return;
		}
		
		// mouse events
		this.canvas.nativeElement.addEventListener('mousedown', this.mouseDown);
		this.canvas.nativeElement.addEventListener('mouseup', this.mouseUp);
		this.canvas.nativeElement.addEventListener('mousemove', this.mouseMove);
		
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
		this.canvas.nativeElement.removeEventListener('mousedown', this.mouseDown);
		this.canvas.nativeElement.removeEventListener('mouseup', this.mouseUp);
		this.canvas.nativeElement.removeEventListener('mousemove', this.mouseMove);
		
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
	
	private onMouseDown(event: MouseEvent): void
	{
		event.stopImmediatePropagation();
		
		this.isDrawing = true;
		
		const mousePos = this.getMousePos(event, 0);
		console.log(mousePos);
		
		/*	let touchPosObj = this.getTouchPosModel(0);
			
			if (touchPosObj)
			{
				touchPosObj.pos = mousePos;
			}
			else
			{
				touchPosObj = new TouchPosModel(0, mousePos);
			}*/
	}
	
	private onMouseMove(event: MouseEvent): void
	{
		event.stopImmediatePropagation();
		
		this.draw(event);
	}
	
	private onMouseUp(event: MouseEvent): void
	{
		this.isDrawing = false;
		
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
	}
	
	private onTouchMove(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		
		this.draw(event);
	}
	
	private onTouchEnd(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		
		this.isDrawing = false;
	}
	
	private onTouchCancel(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		
		this.isDrawing = false;
	}
	
	private getMousePos(event: MouseEvent | TouchEvent, identifier: number): Point2DInterface | null
	{
		const rect = this.canvas!.nativeElement.getBoundingClientRect();
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
			return {
				x: -this.diffBoardX + (clientX - rect.x) * this.canvas!.nativeElement.width / rect.width,
				y: -this.diffBoardY + (clientY - rect.y) * this.canvas!.nativeElement.height / rect.height
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
		if (!this.isDrawing || !this.ctx || !this.canvas)
		{
			return;
		}
		event.preventDefault();
		//const rect = this.canvas.nativeElement.getBoundingClientRect();
		//const x = (event.clientX || event.touches[0].clientX) - rect.left;
		//const y = (event.clientY || event.touches[0].clientY) - rect.top;
		
		const mousePos = this.getMousePos(event, 0);
		
		if (!mousePos)
		{
			return;
		}
		
		this.ctx.fillStyle = '#fff5';
		this.ctx.beginPath();
		this.ctx.arc(mousePos.x, mousePos.y, 20, 0, Math.PI * 2);
		this.ctx.fill();
		
		const imageData = this.ctx.getImageData(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
		const data = imageData.data;
		const totalPixels = data.length / 4;
		let transparent = 0;
		for (let i = 3; i < data.length; i += 4)
		{
			if (data[i] === 255) transparent++;
		}
		const percent = 100 - (transparent / totalPixels) * 100;
		
		this.freePercent = Math.round(percent * 10) / 10;
		
		if (percent > 80)
		{
			//ctx.fillStyle = '#fff';
			//ctx.fillRect(0, 0, canvas.width, canvas.height);
			//this.canvas.nativeElement.classList.add('canvas-fly-away');
			
			this.isFlyAway = true;
		}
		
		this.changeDetectorRef.detectChanges();
	}
}
