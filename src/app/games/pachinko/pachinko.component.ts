import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	inject,
	Input,
	NgZone,
	OnChanges,
	OnDestroy,
	Output,
	signal,
	SimpleChanges,
	ViewChild
} from '@angular/core';
import {AppLoopService} from '../../core/services/app-loop.service';
import {SoundService} from '../../core/services/sound.service';
import {BallHolderModel} from './models/ball-holder.model';
import {BallModel} from './models/ball.model';
import {ColumnModel} from './models/column.model';
import {NailModel} from './models/nail.model';
import {PachinkoGameConfig} from './pachinko-game.config';
import {Point2DInterface} from '../interfaces/point-2D.interface';
import {UtilTimeout} from '../../shared/utils/util-timeout';
import {ImageLoadService} from '../../core/services/image-load.service';
import {ReleaseButtonModel} from './models/release-button.model';
import {NativeTranslateService} from '../../core/services/native-translate.service';
import {AppConfig} from '../../app.config';
import {UtilColor} from '../../shared/utils/util-color';

@Component({
	selector: 'app-pachinko',
	templateUrl: './pachinko.component.html',
	styleUrls: ['./pachinko.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: false
})
export class PachinkoComponent implements AfterViewInit, OnChanges, OnDestroy
{
	private changeDetectorRef = inject(ChangeDetectorRef);
	private imageLoadService = inject(ImageLoadService);
	private soundService = inject(SoundService);
	private nativeTranslateService = inject(NativeTranslateService);
	private ngZone = inject(NgZone);
	
	@ViewChild('pachinkoGame') public pachinkoGame!: ElementRef<HTMLDivElement>;
	@ViewChild('background') public background!: ElementRef<HTMLDivElement>;
	@ViewChild('canvas') public canvas!: ElementRef<HTMLCanvasElement>;
	
	@Input() public ballCount: number = 3;
	//@Input() public columnPoints: Array<number> = [1.1, 1.3, 1.5, 1.7, 2, 1.7, 1.5, 1.3, 1.1];
	@Input() public columnPoints: Array<number> = [1.1, 1.5, 2, 1.5, 1.1];
	
	@Input() public borderColor: string = AppConfig.quizGameDefaultMinigameMainColor;
	@Input() public fontColor: string = AppConfig.quizGameDefaultMinigameFontColor;
	@Input() public fontColorTgt: string = AppConfig.quizGameDefaultMinigameFontColor;
	@Input() public colorBg1: string = AppConfig.quizGameDefaultMinigameBackgroundColor1;
	@Input() public colorBg2: string = AppConfig.quizGameDefaultMinigameBackgroundColor2;
	@Input() public buttonColor: string = AppConfig.quizGameDefaultMinigameMainColor;
	@Input() public ballColor: string = AppConfig.quizGameDefaultMinigameBallColor;
	@Input() public ballHoldColor: string = AppConfig.quizGameDefaultMinigameMainColor;
	@Input() public ballHoldColor2: string = AppConfig.quizGameDefaultMinigameMainColor;
	@Input() public tgtOutColor: string = AppConfig.quizGameDefaultMinigameOutlineColor;
	@Input() public tgtBgColor: string = AppConfig.quizGameDefaultMinigameTargetBackgroundColor;
	@Input() public tgtBgActColor: string = AppConfig.quizGameDefaultMinigameBallColor;
	@Input() public nailColor: string = AppConfig.quizGameDefaultMinigameMainColor;
	
	@Output() public readonly startBall = new EventEmitter<void>();
	@Output() public readonly finishBall = new EventEmitter<{ score: number, position: Point2DInterface }>();
	@Output() public readonly finishGame = new EventEmitter<boolean>();
	
	public signalGameScale = signal<number>(window.innerWidth / 3840);
	protected signalTopOffsetY = signal<number>(0);
	
	private isDebug: boolean = false;
	public signalIsReady = signal<boolean>(false);
	
	private ctx!: CanvasRenderingContext2D;
	private touchElement!: HTMLElement;
	
	protected boardWidth: number = 0;
	protected boardHeight: number = 0;
	protected diffBoardX: number = 0;
	protected diffBoardY: number = 0;
	protected ballHolder!: BallHolderModel;
	protected ballRadius: number = 16;
	protected balls: Array<BallModel> = [];
	protected columns: Array<ColumnModel> = [];
	protected nails: Array<NailModel> = [];
	protected releaseButton: ReleaseButtonModel | null = null;
	//private releaseButtonText: string = '';
	
	protected ballHolderColorRGB05: string =  UtilColor.getRGBAColorFromHexColor(this.ballHoldColor, 0.5);
	protected ballHolderColor2RGB05: string = UtilColor.getRGBAColorFromHexColor(this.ballHoldColor2, 0.5);
	
	protected ballImage: HTMLImageElement = new Image();
	protected ballHolderImage: HTMLImageElement = new Image();
	protected ballHolderOpenImage: HTMLImageElement = new Image();
	protected nailImage: HTMLImageElement = new Image();
	protected nailActiveImage: HTMLImageElement = new Image();
	protected borderImage: HTMLImageElement = new Image();
	
	protected readonly appLoopService: AppLoopService = new AppLoopService(this.loop.bind(this));
	
	constructor()
	{
		this.appLoopService.stop();
		this.appLoopService.setRuntime(0);
		this.appLoopService.init('PachinkoComponent', this.ngZone);
		
		if (!AppConfig.areMultiplierGames)
		{
			this.columnPoints = [100, 200, 500, 200, 100];
		}
	}
	
	public ngAfterViewInit(): void
	{
		UtilTimeout.setTimeout(
			() => {
				this.changeDetectorRef.detectChanges();
				this.init();
			}, 0
		);
		UtilTimeout.setTimeout(
			() => {
				this.changeDetectorRef.detectChanges();
				this.onResize();
				this.changeDetectorRef.detectChanges();
				this.onResize();
			}, 400
		);
		UtilTimeout.setTimeout(
			() => {
				this.onResize();
			}, 1000
		);
	}
	
	public ngOnChanges(changes: SimpleChanges): void
	{
		if ('ballHoldColor' in changes || 'ballHoldColor2' in changes)
		{
			this.ballHolderColorRGB05 = UtilColor.getRGBAColorFromHexColor(this.ballHoldColor, 0.5);
			this.ballHolderColor2RGB05 = UtilColor.getRGBAColorFromHexColor(this.ballHoldColor2, 0.5);
		}
	}
	
	public ngOnDestroy(): void
	{
		this.appLoopService.stop();
		this.removeEventListeners();
	}
	
	@HostListener('window:resize', [])
	public onResize(): void
	{
		this.signalGameScale.set(window.innerWidth / 3840); // x 2160
		
		const background: HTMLDivElement = this.background.nativeElement;
		const canvas: HTMLCanvasElement = this.canvas.nativeElement;
		const width: number = 1080;
		const height: number = 1920;
		
		canvas.width = width; // change this value for drawing border
		canvas.height = height - 100;
		
		this.boardWidth = width - 100;
		this.boardHeight = height - 70;
		
		background.style.width = (width - 100) + 'px';
		background.style.height = (height - 100) + 'px';
		canvas.style.width = canvas.width + 'px';
		canvas.style.height = canvas.height + 'px';
		
		this.diffBoardX = canvas.width * 0.5 - this.boardWidth * 0.5;
		this.diffBoardY = canvas.height * 0.5 - this.boardHeight * 0.5;
		
		const clientWidth = this.pachinkoGame.nativeElement.clientWidth;
		const clientHeight = this.pachinkoGame.nativeElement.clientHeight;
		
		const scaleX = clientWidth / canvas.width;
		const scaleY = clientHeight / canvas.height;
		
		this.signalGameScale.set(Math.min(scaleX, scaleY));
		this.signalTopOffsetY.set(clientHeight * 0.5 - canvas.height * 0.5);
	}
	
	public init(): void
	{
		this.ctx = this.canvas.nativeElement.getContext("2d") as CanvasRenderingContext2D;
		this.touchElement = this.canvas.nativeElement;
		
		this.onResize();
		
		if (PachinkoGameConfig.isUsingImages)
		{
			this.initImages();
		}
		
		const nailY: number = -160;
		const nailGap = 57 * PachinkoGameConfig.sizeFactor; // 50 * PachinkoGame.sizeFactor;
		const nailRadius = 3 * PachinkoGameConfig.sizeFactor;
		const nailCountX = Math.floor(this.boardWidth / nailGap) + 1;
		const nailCountY = Math.floor(this.boardHeight / nailGap) - 1;
		let isShifting = false;
		
		for (let y = 3; y < nailCountY - 2; y++)
		{
			for (let x = 0; x < nailCountX; x++)
			{
				const xPos = x * nailGap - (isShifting ? nailGap * 0.5 : 0) + 2;
				const yPos = y * nailGap * 1.1 + nailY;
				if (y % 2 === 1 || y % 2 === 0 && x > 0 && x < nailCountX)
				{
					this.nails.push(new NailModel(
						xPos,
						yPos,
						nailRadius,
						0,
						0
					));
				}
			}
			
			isShifting = !isShifting;
		}
		
		this.ballHolder = new BallHolderModel(
			this.boardWidth * 0.5,
			150,
			this.ballRadius * 2.5 * PachinkoGameConfig.sizeFactor,
			this.ballRadius * 2.5 * PachinkoGameConfig.sizeFactor
		);
		
		// create columns
		const columnHeight = 50 * PachinkoGameConfig.sizeFactor;
		const columnPoints = this.columnPoints;
		const numColumns = columnPoints.length;
		const columnWidth = this.boardWidth / numColumns;
		
		for (let i = 0; i < numColumns; i++)
		{
			const x = columnWidth * (i + 0.5);
			const y = this.boardHeight - columnHeight - 470; //22;
			const points = columnPoints[i];
			this.columns.push(
				new ColumnModel(
					x,
					y,
					columnWidth,
					columnHeight,
					points,
					false,
					false,
					0,
					0
				));
		}
		
		if (PachinkoGameConfig.isAutomaticLeftRightMovement)
		{
			this.releaseButton = new ReleaseButtonModel(
				0, this.boardHeight * 0.82, 240, 240// 500, 200
			);
			this.releaseButton.x = this.boardWidth * 0.5 - this.releaseButton.width * 0.5 + this.diffBoardX;
			//this.releaseButtonText = this.nativeTranslateService.instant('pachinko-press');
		}
		
		this.initSounds();
	}
	
	public startGame(): void
	{
		this.addEventListeners();
		
		this.signalIsReady.set(true);
		this.changeDetectorRef.detectChanges();
		
		this.appLoopService.start();
		this.soundService.playSound('pachinkoStart', true);
		
		UtilTimeout.setTimeout(
			() => {
				//this.soundService.playSound('pachinkoStart', true);
				//this.addBall(this.boardWidth * 0.5, 0);
				this.addBall(this.ballHolder.x, 0);
				// this.addBall(85, 565); // test a hanging ball
				this.changeDetectorRef.detectChanges();
			}, 700
		);
	}
	
	private initImages(): void
	{
		this.setImage('ballImage', 'assets/games/ball-game/images/ball.png');
		this.setImage('ballHolderImage', 'assets/games/ball-game/images/ball-holder.png');
		this.setImage('ballHolderOpenImage', 'assets/games/ball-game/images/ball-holder-open.png');
		this.setImage('nailImage', 'assets/games/pachinko/images/nail.png');
		this.setImage('nailActiveImage', 'assets/games/pachinko/images/nail-active.png');
		this.setImage('borderImage', 'assets/games/ball-game/images/border.png');
	}
	
	private setImage(id: string, url: string, attributeName: string | null = null): void
	{
		const image: HTMLImageElement | null = this.imageLoadService.getImage(id);
		if (image)
		{
			(this as any)[attributeName ? attributeName : id] = image;
		}
		else
		{
			const image2 = new Image();
			image2.src = url;
			image2.onload = () => {
				(this as any)[attributeName ? attributeName : id] = image2;
			};
		}
	}
	
	private initSounds(): void
	{
		this.soundService.addSound('pachinkoStart', 'assets/games/pachinko/sounds/start.mp3');
		for (let i = 1; i <= 5; i++)
		{
			this.soundService.addSound('coinTarget0' + i, `assets/games/ball-game/sounds/coin-target0${i}.mp3`);
		}
		for (let i = 1; i <= 4; i++)
		{
			this.soundService.addSound('ballCollision' + i, 'assets/games/ball-game/sounds/ball-collision' + (i < 10 ? '0' : '') + i + '.mp3');
		}
		for (let i = 1; i <= 4; i++)
		{
			this.soundService.addSound('pachinkoNail' + i, 'assets/games/pachinko/sounds/nail' + (i < 10 ? '0' : '') + i + '.mp3');
		}
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
		this.touchElement.addEventListener('mousedown', this.mouseDown);
		window.addEventListener('mouseup', this.mouseUp);
		this.touchElement.addEventListener('mousemove', this.mouseMove);
		
		// touch events
		this.touchElement.addEventListener('touchstart', this.touchElementTouchStart, {passive: false});
		this.touchElement.addEventListener('touchstart', this.touchStart);
		this.touchElement.addEventListener('touchmove', this.touchMove);
		window.addEventListener('touchend', this.touchEnd);
		window.addEventListener('touchcancel', this.touchCancel);
	}
	
	private removeEventListeners(): void
	{
		// mouse events
		this.touchElement?.removeEventListener('mousedown', this.mouseDown);
		window.removeEventListener('mouseup', this.mouseUp);
		this.touchElement?.removeEventListener('mousemove', this.mouseMove);
		
		// touch events
		this.touchElement?.removeEventListener('touchstart', this.touchElementTouchStart);
		this.touchElement?.removeEventListener('touchstart', this.touchStart);
		this.touchElement?.removeEventListener('touchmove', this.touchMove);
		window.removeEventListener('touchend', this.touchEnd);
		window.removeEventListener('touchcancel', this.touchCancel);
	}
	
	private onTouchElementTouchStart(event: TouchEvent): void
	{
		event.preventDefault();
	}
	
	protected onMouseDown(event: MouseEvent): void
	{
		event.stopImmediatePropagation();
		event.preventDefault();
		
		if (!this.ballHolder)
		{
			return;
		}
		
		const mousePos: Point2DInterface | null = this.getMousePos(event, 0);
		if (!mousePos)
		{
			return;
		}
		
		this.onDown(mousePos);
	}
	
	protected onTouchStart(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		event.preventDefault();
		
		if (event.touches.length != 1)
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
		if (!PachinkoGameConfig.isAutomaticLeftRightMovement)
		{
			const isColBallHolder: boolean = this.checkCircleRectCollision(
				{
					x: mousePos.x,
					y: mousePos.y,
					radius: this.ballHolder.width * 0.5 * window.devicePixelRatio
				}, {
					x: this.ballHolder.x - this.ballHolder.width * 0.5,
					y: this.ballHolder.y - this.ballHolder.height * 0.5,
					width: this.ballHolder.width,
					height: this.ballHolder.height
				}
			);
			
			if (isColBallHolder)
			{
				this.ballHolder.isDragging = true;
				this.ballHolder.dragPosX = this.ballHolder.x;
			}
		}
		
		if (!this.releaseButton)
		{
			return;
		}
		
		if (this.isMousePosInsideReleaseButton(mousePos))
		{
			//	this.soundService.playSound('bowDraw', true, 0.7);
			this.releaseButton.isPressed = true;
		}
	}
	
	protected onMouseUp(event: MouseEvent): void
	{
		event.stopImmediatePropagation();
		event.preventDefault();
		
		if (!this.ballHolder)
		{
			return;
		}
		
		const mousePos: Point2DInterface | null = this.getMousePos(event, 0);
		if (!mousePos)
		{
			return;
		}
		
		this.onUp(mousePos);
	}
	
	protected onTouchEnd(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		
		if (!this.ballHolder || event.touches.length > 0)
		{
			return;
		}
		
		const changedTouchesArray = Array.from(event.changedTouches);
		const mousePos: Point2DInterface | null = this.getMousePos(event, changedTouchesArray[0].identifier);
		if (!mousePos)
		{
			return;
		}
		
		this.onUp(mousePos);
	}
	
	protected onTouchCancel(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		event.preventDefault();
		
		if (!this.releaseButton)
		{
			return;
		}
		
		this.releaseButton.isPressed = false;
	}
	
	private onUp(mousePos: Point2DInterface): void
	{
		const diffX: number = Math.abs(this.ballHolder.x - this.ballHolder.dragPosX);
		
		const isColBallHolder: boolean = this.checkCircleRectCollision(
			{
				x: mousePos.x,
				y: mousePos.y,
				radius: 5
			}, {
				x: this.ballHolder.x - this.ballHolder.width * 0.5,
				y: this.ballHolder.y - this.ballHolder.height * 0.5,
				width: this.ballHolder.width,
				height: this.ballHolder.height
			}
		);
		//console.log(Math.round(diffX), this.ballHolder.width * 0.1);
		if (
			!this.ballHolder.isOpen &&
			diffX < this.ballHolder.width * 0.25 &&
			(mousePos.x === 0 || isColBallHolder)
		)
		{
			for (const ball of this.balls)
			{
				ball.isReleased = true;
			}
			
			this.startBall.emit();
			this.ballHolder.open();
		}
		
		this.ballHolder.isDragging = false;
		
		// release button
		if (!this.releaseButton || !mousePos)
		{
			return;
		}
		
		if (this.releaseButton.isPressed)
		{
			this.releaseButton.isPressed = false;
			
			if (!this.ballHolder.isOpen)
			{//this.shootBall(this.releaseButton.pressFactor);
				this.startBall.emit();
				this.ballHolder.open();
				this.soundService.stopSound('bowDraw');
				this.soundService.playSound('dropIn', true);
			}
			//this.releaseButton.pressFactor = 0;
			//this.changeDetectorRef.detectChanges();
		}
	}
	
	protected onMouseMove(event: MouseEvent): void
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
	
	protected onTouchMove(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		// event.preventDefault(); // calls warnings in Chrome
		
		if (!this.ballHolder)
		{
			return;
		}
		
		// const changedTouchesArray = Array.from(event.changedTouches);
		const mousePos: Point2DInterface | null = this.getMousePos(event, event.touches[0].identifier);
		if (!mousePos)
		{
			return;
		}
		
		this.onMove(mousePos);
	}
	
	private onMove(mousePos: Point2DInterface): void
	{
		if (this.ballHolder && this.ballHolder?.isDragging)
		{
			this.ballHolder.x = mousePos.x;
			
			const ballHolderMargin: number = this.ballHolder.width * 0.8;
			if (this.ballHolder.x < this.ballHolder.width * 0.5 + ballHolderMargin)
			{
				this.ballHolder.x = this.ballHolder.width * 0.5 + ballHolderMargin;
			}
			else if (this.ballHolder.x > this.boardWidth - this.ballHolder.width * 0.5 - ballHolderMargin)
			{
				this.ballHolder.x = this.boardWidth - this.ballHolder.width * 0.5 - ballHolderMargin;
			}
		}
		
		// release button
		if (!this.releaseButton)
		{
			return;
		}
		
		if (
			this.releaseButton.isPressed &&
			!this.isMousePosInsideReleaseButton(mousePos)
		)
		{
			this.releaseButton.isPressed = false;
			
			//this.shootBall(this.releaseButton.pressFactor);
			this.startBall.emit();
			this.ballHolder.open();
			
			//this.releaseButton.pressFactor = 0;
			//this.changeDetectorRef.detectChanges();
		}
	}
	
	private isMousePosInsideReleaseButton(mousePos: Point2DInterface): boolean
	{
		if (!this.releaseButton)
		{
			return false;
		}
		
		/*console.log(
			//	Math.round(mousePos.x), this.releaseButton.x - this.diffBoardX, this.releaseButton.x + this.releaseButton.width - this.diffBoardX,
			Math.round(mousePos.y),	this.releaseButton.y-  this.diffBoardY,	this.releaseButton.y + this.releaseButton.height - this.diffBoardY
		);*/
		
		return (
			mousePos.x >= this.releaseButton.x - this.diffBoardX &&
			mousePos.x <= this.releaseButton.x + this.releaseButton.width - this.diffBoardX &&
			mousePos.y >= this.releaseButton.y - this.diffBoardY &&
			mousePos.y <= this.releaseButton.y + this.releaseButton.height - this.diffBoardY
		);
	}
	
	protected onButtonMouseLeave(): void
	{
		if (this.releaseButton?.isPressed)
		{
			this.releaseButton.isPressed = false;
			
			//this.shootBall(this.releaseButton.pressFactor);
			this.startBall.emit();
			this.ballHolder.open();
			
			//this.releaseButton.pressFactor = 0;
			//this.changeDetectorRef.detectChanges();
		}
	}
	
	private getMousePos(event: MouseEvent | TouchEvent, identifier: number): Point2DInterface | null
	{
		const rect = this.touchElement.getBoundingClientRect();
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
				x: -this.diffBoardX + (clientX - rect.x) * this.canvas.nativeElement.width / rect.width,
				y: -this.diffBoardY + (clientY - rect.y) * this.canvas.nativeElement.height / rect.height
			};
		}
		
		return null;
	}
	
	/*private onMouseOut(): void
	{
		this.ballHolder.isDragging = false;
	}*/
	
	private addBall(x: number, y: number): void
	{
		if (this.ballCount <= 0)
		{
			return;
		}
		
		this.ballCount--;
		
		this.balls.push(new BallModel(
			x,
			y,
			0,
			0,
			this.ballRadius * PachinkoGameConfig.sizeFactor,
			Math.PI * 0.5
		));
	}
	
	private removeBall(ball: any)
	{
		this.balls.splice(this.balls.indexOf(ball), 1);
	}
	
	/*private resetBall(ball: any)
	{
		ball.x = this.ballHolder.x;// this.boardWidth * Math.random();
		ball.y = 0;
		ball.dx = 0;
		ball.dy = 0;
		ball.angle = Math.PI * 0.5;
	}*/
	
	private draw()
	{
		if (!this.ctx || !this.canvas)
		{
			return;
		}
		
		this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
		//this.ctx.fillStyle = "#00000088";
		//this.ctx.fillRect(this.diffBoardX, this.diffBoardY, this.boardWidth, this.boardHeight);
		
		/*this.ctx.strokeStyle = "#ff0000";
		this.ctx.lineWidth = 5;
		this.ctx.strokeRect(
			0,
			0,
			this.canvas.nativeElement.width,
			this.canvas.nativeElement.height
		);*/
		
		// draw nails
		//this.ctx.fillStyle = "#333333";
		if (PachinkoGameConfig.isUsingImages)
		{
			if (this.nailImage && this.nailActiveImage)
			{
				for (const nail of this.nails)
				{
					const isStutter: boolean = nail.stutterX !== 0 || nail.stutterY !== 0;
					
					const image = isStutter ? this.nailActiveImage : this.nailImage;
					const padding: number = 15 * PachinkoGameConfig.sizeFactor;
					this.ctx.drawImage(image,
						this.diffBoardX + nail.x - nail.radius - nail.stutterX - padding,
						this.diffBoardY + nail.y - nail.radius + nail.stutterY - padding,
						nail.radius * 2 + padding * 2,
						nail.radius * 2 - nail.stutterY * 0.5 + padding * 2
					);
				}
			}
		}
		else
		{
			for (const nail of this.nails)
			{
				const isStutter: boolean = nail.stutterX !== 0 || nail.stutterY !== 0;
				
				const padding: number = 3 * PachinkoGameConfig.sizeFactor;
				
				this.ctx.beginPath();
				this.ctx.fillStyle = isStutter ? this.ballColor : this.nailColor;// "#b7e8dd";
				this.ctx.shadowColor = isStutter ? this.ballColor : this.nailColor; // "#b7e8dd";
				this.ctx.shadowOffsetX = 0; // Horizontal distance of the shadow, in relation to the text.
				this.ctx.shadowOffsetY = 0; // Vertical distance of the shadow, in relation to the text.
				
				this.ctx.shadowBlur = isStutter ? 30 : 10; // Blurring effect to the shadow, the larger the value, the greater the blur.
				
				this.ctx.arc(
					this.diffBoardX + nail.x - nail.radius - nail.stutterX + padding,
					this.diffBoardY + nail.y - nail.radius + nail.stutterY + padding,
					nail.radius - (isStutter ? 2 : 4), 0, 2 * Math.PI
				);
				
				this.ctx.fill();
			}
			
			this.ctx.shadowBlur = 0;
		}
		
		if (PachinkoGameConfig.isUsingImages)
		{
			if (this.ballImage)
			{
				for (const ball of this.balls)
				{
					this.ctx.drawImage(this.ballImage,
						this.diffBoardX + ball.x - ball.radius - 15,
						this.diffBoardY + ball.y - ball.radius - 15,
						ball.radius * 2 + 30,
						ball.radius * 2 + 30
					);
					
					if (this.isDebug)
					{
						this.ctx.fillText(
							ball.diffX.toString(),
							this.diffBoardX + ball.x - ball.radius - 15,
							this.diffBoardY + ball.y - ball.radius - 15
						);
						
						this.ctx.beginPath();
						this.ctx.arc(this.diffBoardX + ball.x, this.diffBoardY + ball.y, 5, 0, 2 * Math.PI, false);
						this.ctx.fillStyle = '#f00';
						this.ctx.fill();
						this.ctx.lineWidth = 2;
						this.ctx.strokeStyle = '#fff';
						this.ctx.stroke();
					}
				}
			}
		}
		else
		{
			for (const ball of this.balls)
			{
				this.ctx.strokeStyle = this.ballColor;//"#ec6a1e";
				this.ctx.lineWidth = 10;
				this.ctx.beginPath();
				
				this.ctx.shadowColor = this.ballColor;//"#ffffff";
				this.ctx.shadowOffsetX = 0; // Horizontal distance of the shadow, in relation to the text.
				this.ctx.shadowOffsetY = 0; // Vertical distance of the shadow, in relation to the text.
				this.ctx.shadowBlur = 8; // Blurring effect to the shadow, the larger the value, the greater the blur.
				
				this.ctx.arc(
					this.diffBoardX + ball.x,
					this.diffBoardY + ball.y,
					ball.radius - 5,
					0,
					2 * Math.PI
				);
				this.ctx.stroke();
				
				this.ctx.shadowBlur = 0;
				
				this.ctx.strokeStyle = this.ballColor;//"#ec6a1e";
				this.ctx.lineWidth = 3;
				this.ctx.arc(
					this.diffBoardX + ball.x,
					this.diffBoardY + ball.y,
					ball.radius - 5,
					0,
					2 * Math.PI
				);
				this.ctx.stroke();
			}
			
			this.ctx.shadowBlur = 0;
		}
		
		if (this.isDebug)
		{   // ball holder
			this.ctx.strokeStyle = "#733f01";
			this.ctx.lineWidth = 15;
			this.ctx.strokeRect(
				this.diffBoardX + this.ballHolder.x - this.ballHolder.width * 0.5,
				this.diffBoardY + this.ballHolder.y - this.ballHolder.height * 0.5,
				this.ballHolder.width,
				this.ballHolder.height
			);
			// bottom ball holder
			if (!this.ballHolder.isOpen)
			{
				this.ctx.strokeStyle = "#da7b06";
				this.ctx.strokeRect(
					this.diffBoardX + this.ballHolder.x - this.ballHolder.width * 0.5,
					this.diffBoardY + this.ballHolder.y - this.ballHolder.height * 0.5 + this.ballHolder.height,
					this.ballHolder.width,
					5
				);
			}
		}
		
		if (PachinkoGameConfig.isUsingImages)
		{
			if (this.ballHolderImage && this.ballHolderOpenImage)
			{
				const width: number = this.ballRadius * 6.5 * PachinkoGameConfig.sizeFactor;
				const height: number = this.ballHolderImage.height * width / this.ballHolderImage.width;
				//this.ctx.imageSmoothingEnabled = true;
				this.ctx.drawImage(this.ballHolder.isOpen ? this.ballHolderOpenImage : this.ballHolderImage,
					this.diffBoardX + this.ballHolder.x - width * 0.5,
					this.diffBoardY + this.ballHolder.y - height * 0.38,
					width,
					height
				);
				//this.ctx.imageSmoothingEnabled = false;
				
				if (this.isDebug)
				{
					this.ctx.fillStyle = '#900707';
					this.ctx.fillRect(this.diffBoardX + this.ballHolder.x - this.ballHolderImage.width,
						this.diffBoardY + this.ballHolder.y - height * 0.1,
						10, 10);
				}
				// 316, 101 = this.ballHolder.width * 1.75 , x
			}
		}
		else
		{
			this.drawBallHolderWing(-1, false, false);
			this.drawBallHolderWing(1, false, false);
			this.drawBallHolderWing(-1, true, false);
			this.drawBallHolderWing(1, true, false);
			this.drawBallHolderWing(-1, true, true);
			this.drawBallHolderWing(1, true, true);
			
			if (!this.ballHolder.isOpen)
			{
				this.drawBallHolderClosedLine();
			}
		}
		
		if (this.isDebug)
		{
			this.ctx.fillText(
				this.ballHolder.openTime.toString() + ' ' + this.ballHolder.isDragging + ' ' +
				Math.round(this.ballHolder.dragPosX) + ' ' + Math.round(this.ballHolder.x),
				this.diffBoardX + this.ballHolder.x - this.ballHolder.width * 0.5,
				this.diffBoardY + this.ballHolder.y - this.ballHolder.height * 0.4
			);
		}
		
		for (const column of this.columns)
		{
			this.ctx.shadowBlur = 0;
			this.ctx.shadowColor = "#ffffff";
			this.ctx.shadowOffsetX = 0; // Horizontal distance of the shadow, in relation to the text.
			this.ctx.shadowOffsetY = 0; // Vertical distance of the shadow, in relation to the text.
			
			this.ctx.fillStyle = column.finishTime > 0 ? this.tgtBgActColor : this.tgtBgColor;// `rgba(${187 * 0.6},${89 * 0.6},${240 * 0.6}, 1)` : "#55555533";
			this.ctx.fillRect(this.diffBoardX + column.x - column.width * 0.5, this.diffBoardY + column.y, column.width, column.height);
			
			if (column.collisionTime > 0)
			{
				this.ctx.fillStyle = this.ballColor;// `rgba(${187 * 0.8},${89 * 0.8},${240 * 0.8}, 1)`;
				this.ctx.shadowBlur = 20; // Blurring effect to the shadow, the larger the value, the greater the blur.
			}
			else
			{
				this.ctx.fillStyle = this.tgtOutColor;//"#000000";
			}
			this.ctx.fillRect(this.diffBoardX + column.x - column.width * 0.5,
				this.diffBoardY + column.y, 2 * PachinkoGameConfig.sizeFactor, column.height);
			
			if (column.collisionTime > 0)
			{
				this.ctx.fillStyle = this.ballColor;//'#00bd0c4';
			}
			else
			{
				this.ctx.fillStyle = this.tgtOutColor;//"#000000";
			}
			
			this.ctx.fillRect(
				this.diffBoardX + column.x + column.width * 0.5 - 2 * PachinkoGameConfig.sizeFactor,
				this.diffBoardY + column.y,
				2 * PachinkoGameConfig.sizeFactor,
				column.height);
			
			this.ctx.fillStyle = this.fontColorTgt; // "#FFFFFF";
			this.ctx.font = 'bold ' + (16 * PachinkoGameConfig.sizeFactor) + 'px Arial';
			this.ctx.textAlign = 'center'; // horizontal center
			this.ctx.textBaseline = 'middle'; // vertical center
			this.ctx.fillText(
				column.points.toLocaleString(this.nativeTranslateService.currentLocale ?? 'en-US'),// + ' Cr.',
				this.diffBoardX + column.x,
				this.diffBoardY + column.y + column.height * 0.5
			);
		}
		
		if (PachinkoGameConfig.isUsingImages)
		{
			if (this.borderImage)
			{
				this.ctx.drawImage(this.borderImage,
					0,
					-200,
					this.canvas.nativeElement.width,
					this.canvas.nativeElement.height + 320
				);
			}
		}
		else
		{
			const x = 45;
			const y = 5;
			const width = this.canvas.nativeElement.width - 90;
			const height = this.canvas.nativeElement.height - 10;
			
			this.ctx.strokeStyle = this.borderColor;// "#FFFFFFaa";
			this.ctx.lineWidth = 5;
			
			this.ctx.beginPath();
			this.ctx.moveTo(x, y);
			this.ctx.lineTo(x, y + height);
			this.ctx.lineTo(x + width, y + height);
			this.ctx.lineTo(x + width, y);
			// this.ctx.closePath();   // Do not close, so no top line is showing
			
			this.ctx.stroke();
		}
		
		// this.drawReleaseButton();
	}
	
	private drawBallHolderWing(sign: number, isContour: boolean, isSmall: boolean): void
	{
		const centerX: number = this.diffBoardX + this.ballHolder.x + (isSmall ? 10 * sign : 0);// + width * 0.5;
		const centerY: number = this.diffBoardY + this.ballHolder.y + 10;// - height * 0.38;
		const wingOffset: number = 60;
		const wingHeight: number = isSmall ? 20 : 30;
		const tipOffset: number = isSmall ? 45 : 75;
		
		this.ctx.save();
		
		if (isContour)
		{
			this.ctx.shadowColor = isSmall ? this.ballHolderColor2RGB05 : this.ballHolderColorRGB05;//"#ffffff";
			this.ctx.shadowBlur = 30;
			this.ctx.lineWidth = 1;
			this.ctx.strokeStyle = isSmall ? this.ballHoldColor2 : this.ballHoldColor;// "rgba(187,89,240, 1)";
		}
		else
		{
			this.ctx.shadowColor = isSmall ? this.ballHolderColor2RGB05 : this.ballHolderColorRGB05;//"rgba(187,89,240, 0.5)"; // glow
			this.ctx.shadowBlur = 6; // glow width
			this.ctx.lineWidth = 4;
			this.ctx.strokeStyle = isSmall ? this.ballHoldColor2 : this.ballHoldColor;// "rgba(187,89,240, 1)";
		}
		this.ctx.beginPath();
		
		const sx = centerX + sign * wingOffset;
		const sy = centerY;
		const factor = 5;
		
		this.ctx.moveTo(sx - sign * factor, sy - wingHeight); // start
		this.ctx.lineTo(sx, sy); // inner line middle
		this.ctx.lineTo(sx - sign * factor, sy + wingHeight); // inner line to bottom
		this.ctx.lineTo(sx + tipOffset * 0.25 * sign, sy + wingHeight); // line at bottom
		this.ctx.lineTo(sx + tipOffset * sign, sy); // line bottom to the tip
		this.ctx.lineTo(sx + tipOffset * 0.25 * sign, sy - wingHeight); // line from tip to above
		this.ctx.lineTo(sx - sign * factor, sy - wingHeight); // line above to start
		this.ctx.stroke();
		this.ctx.restore();
	}
	
	private drawBallHolderClosedLine(): void
	{
		const centerX: number = this.diffBoardX + this.ballHolder.x;// + width * 0.5;
		const centerY: number = this.diffBoardY + this.ballHolder.y + 10;// - height * 0.38;
		const width: number = 100;
		const wingHeight: number = 40;
		
		this.ctx.save();
		
		this.ctx.shadowColor = this.ballHoldColor2;// "rgba(187,89,240, 0.5)"; // glow
		this.ctx.shadowBlur = 10; // glow width
		this.ctx.lineWidth = 4;
		this.ctx.lineWidth = 10;
		this.ctx.strokeStyle = this.ballHoldColor2;//"rgba(187,89,240, 0.5)";
		
		this.ctx.beginPath();
		this.ctx.moveTo(centerX - width * 0.5, centerY + wingHeight); // start
		this.ctx.lineTo(centerX + width * 0.5, centerY + wingHeight); // end
		this.ctx.stroke();
		this.ctx.restore();
	}
	
	/*private drawReleaseButton(): void
	{
		if (!this.releaseButton)
		{
			return;
		}
		
		this.ctx.beginPath();
		this.ctx.strokeStyle = '#aaa';
		this.ctx.lineWidth = 5;
		this.ctx.stroke();
		
		this.ctx.beginPath();
		this.ctx.fillStyle = '#005';
		this.ctx.rect(
			this.diffBoardX + this.releaseButton.x,
			this.diffBoardY + this.releaseButton.y + this.releaseButton.height -
			this.releaseButton.height * this.releaseButton.pressFactor,
			this.releaseButton.width,
			this.releaseButton.height * this.releaseButton.pressFactor
		);
		this.ctx.fill();
		
		this.ctx.strokeStyle = this.releaseButton.isPressed ? "#f00" : "#da7b06";
		this.ctx.strokeRect(
			this.diffBoardX + this.releaseButton.x,
			this.diffBoardY + this.releaseButton.y,
			this.releaseButton.width,
			this.releaseButton.height
		);
		this.ctx.closePath();
		
		this.ctx.fillStyle = '#fff';
		this.ctx.font = 'bold 36px Arial';
		this.ctx.textAlign = 'center'; // horizontal center
		this.ctx.textBaseline = 'middle'; // vertical center
		//this.ctx.fillText(
		//	this.nativeTranslateService.instant(this.releaseButtonText),
		//	this.diffBoardX + this.releaseButton.x + this.releaseButton.width * 0.5,
		//	this.diffBoardY + this.releaseButton.y + this.releaseButton.height * 0.5
		//);
		
		if (this.releaseButton)
		{
			const x: number = this.diffBoardX + this.releaseButton.x + this.releaseButton.width * 0.5;
			const y: number = this.diffBoardY + this.releaseButton.y + this.releaseButton.height * 0.5;
			const maxWidth: number = this.releaseButton.width * 0.8; // padding inside the rect
			const lineHeight: number = 45;
			CanvasContextUtil.drawWrappedText(this.ctx, this.releaseButtonText, x, y, maxWidth, lineHeight);
		}
	}*/
	
	private update(delta: number)
	{
		const isBallHolderOpen: boolean = this.ballHolder.isOpen;
		this.ballHolder.update(delta);
		if (this.releaseButton)
		{
			this.releaseButton.update(delta);
		}
		
		if (isBallHolderOpen && !this.ballHolder.isOpen) // it was closed one step before
		{
			//this.addBall(this.boardWidth * 0.5, 0);
			this.addBall(this.ballHolder.x, 0);
		}
		
		for (const nail of this.nails)
		{
			nail.updateStuttering(delta);
		}
		
		for (const column of this.columns)
		{
			column.update(delta);
		}
		
		for (const ball of this.balls)
		{
			ball.update(delta);
			
			this.checkCollisionBallWallBorder(ball);
			
			const ballOutsideY: number = this.columns[0].y + this.columns[0].height * 0.5;// this.boardHeight;
			
			if (ball.y - ball.radius > ballOutsideY)
			{
				//ball.dy = -ball.dy * 0.6;
				const points: number = this.checkAndGetPoints(ball);
				/*const pointSounds: any = {
					10: 'coinTarget05',
					8: 'coinTarget04',
					6: 'coinTarget03',
					4: 'coinTarget02',
					2: 'coinTarget01'
				};*/
				
				const pointSounds: any = {};
				pointSounds[this.columnPoints[2]] = 'coinTarget05';
				pointSounds[this.columnPoints[1]] = 'coinTarget03';
				pointSounds[this.columnPoints[0]] = 'coinTarget01';
				
				/*const pointSounds: any = {
					2: 'coinTarget05',
					1.5: 'coinTarget03',
					1.1: 'coinTarget01'
				};*/
				
				if (points in pointSounds)
				{
					this.soundService.playSound(pointSounds[points], true);
				}
				else
				{
					this.soundService.playSound('coinTarget01', true);
				}
				
				const position: Point2DInterface = {x: ball.x, y: ball.y};
				
				this.removeBall(ball);
				
				this.finishBall.emit({score: points, position: position});
				
				// finish game
				if (this.balls.length <= 0)
				{
					this.finishGame.emit(true);
					
					UtilTimeout.setTimeout(() => {
						this.signalIsReady.set(false);
					}, 1100);
				}
			}
			
			if (!ball.isReleased)
			{
				this.checkCollisionBallHolder(ball);
			}
			
			for (const nail of this.nails)
			{
				this.checkCollisionBallNail(delta, ball, nail);
			}
			
			let column: ColumnModel;
			let nextColumn: ColumnModel | null;
			for (let i = 0, n = this.columns.length; i < n; ++i)
			{
				column = this.columns[i];
				nextColumn = i < n - 1 ? this.columns[i + 1] : null;
				this.checkCollisionColumn(ball, column, nextColumn);
			}
		}
	}
	
	private checkCollisionBallWallBorder(ball: BallModel): void
	{
		if (ball.x - ball.radius < 0 || ball.x + ball.radius > this.boardWidth)
		{
			ball.dx = -ball.dx;
			if (ball.x - ball.radius < 0)
			{
				ball.x = ball.radius * 0.9;
			}
			else
			{
				ball.x = this.boardWidth - ball.radius * 0.9;
			}
		}
	}
	
	private checkCollisionBallNail(delta: number, ball: BallModel, nail: NailModel): void
	{
		const dist = Math.sqrt((ball.x - nail.x) ** 2 + (ball.y - nail.y) ** 2);
		if (dist < ball.radius * 0.7 + nail.radius)
		{
			ball.x = ball.oldX;
			ball.y = ball.oldY - 0.1;
			
			let diffX = Math.abs(ball.x - nail.x);
			const diffY = Math.abs(ball.y - nail.y);
			ball.diffX = diffX;
			if (diffX < 0.12 * PachinkoGameConfig.sizeFactor)
			{
				diffX *= 1.5 * PachinkoGameConfig.sizeFactor;
			}
			const factor: number = 0.004;
			if (diffY > nail.radius) // is ball is more above the nail
			{
				if (ball.x < nail.x)
				{
					ball.dx -= Math.random() * diffX * factor * delta * PachinkoGameConfig.sizeFactor;
					//ball.dx = Math.min(0.1, ball.dx);
					nail.stutterX = -2 * PachinkoGameConfig.sizeFactor;
				}
				else
				{
					ball.dx += Math.random() * diffX * factor * delta * PachinkoGameConfig.sizeFactor;
					nail.stutterX = 2 * PachinkoGameConfig.sizeFactor;
				}
				
				// add additional force to the ball to move it outside a nail 2025-11-12
				ball.y = nail.y - nail.radius * 1.7 * PachinkoGameConfig.sizeFactor;
				
				ball.dy = -ball.dy * 0.7;
				
				// near pin and slow
				if (
					ball.dy < -0.1 * PachinkoGameConfig.sizeFactor &&
					ball.dx < 0.1 * PachinkoGameConfig.sizeFactor &&
					ball.dx > -0.1 * PachinkoGameConfig.sizeFactor
				)
				{
					ball.dy = -0.3 * PachinkoGameConfig.sizeFactor;
					ball.dx -= Math.random() * diffX * 0.02 * delta * PachinkoGameConfig.sizeFactor;
				}
			}
			else
			{
				if (ball.x < nail.x)
				{
					ball.dx -= Math.random() * diffX * 0.002 * delta * PachinkoGameConfig.sizeFactor;
				}
				else
				{
					ball.dx += Math.random() * diffX * 0.002 * delta * PachinkoGameConfig.sizeFactor;
				}
				ball.dy = -ball.dy * 0.0175 * PachinkoGameConfig.sizeFactor;
			}
			
			if (diffX < 0.0526 * PachinkoGameConfig.sizeFactor)
			{
				ball.dx = ((-1 + Math.random()) * 2) * 0.02 * delta * PachinkoGameConfig.sizeFactor;
			}
			
			nail.stutterY = 2 * PachinkoGameConfig.sizeFactor;
			
			const volume = Math.max(0.1, Math.min(1, Math.abs(ball.dy * 0.4)));
			this.playNailSound(volume);
		}
	}
	
	private checkCollisionBallHolder(ball: BallModel): void
	{
		if (!this.ballHolder)
		{
			return;
		}
		
		const isColLeft = this.checkCircleRectCollision(ball, {
			x: 0, // this.ballHolder.x - this.ballHolder.width * 0.5,
			y: this.ballHolder.y - this.ballHolder.height * 0.5,
			width: this.ballHolder.x - this.ballHolder.width * 0.5, // this.boardWidth,//2 * PachinkoGame.sizeFactor,
			height: this.ballHolder.height
		});
		const isColRight = this.checkCircleRectCollision(ball, {
			x: this.ballHolder.x + this.ballHolder.width * 0.5,
			y: this.ballHolder.y - this.ballHolder.height * 0.5,
			width: this.boardWidth, //2 * PachinkoGame.sizeFactor,
			height: this.ballHolder.height
		});
		const isColBottom = !this.ballHolder.isOpen && this.checkCircleRectCollision(ball, {
			x: this.ballHolder.x - this.ballHolder.width * 0.5,
			y: this.ballHolder.y + this.ballHolder.height * 0.5 - 10,
			width: this.ballHolder.width,
			height: 2 * PachinkoGameConfig.sizeFactor
		});
		
		const diffY = Math.abs(ball.y - ball.oldY);
		
		if (isColBottom)
		{
			ball.dy *= -0.9;
			ball.y = ball.oldY;
		}
		
		if (isColLeft)
		{
			if (!PachinkoGameConfig.isAutomaticLeftRightMovement)
			{
				ball.dy *= -0.9;
				ball.y = ball.oldY;
			}
			
			//ball.x = ball.oldX + 0.1;
			ball.x = this.ballHolder.x - this.ballHolder.width * 0.5 + ball.radius + 2;
			ball.dx = 0.5;
			
			if (!ball.isColLeft)
			{
				ball.isColLeft = true;
				ball.isColRight = false;
				const volume = Math.max(0.1, Math.min(1, Math.abs(ball.dx * 0.1)));
				this.playBallCollisionSound(volume);
			}
		}
		else if (isColRight)
		{
			if (!PachinkoGameConfig.isAutomaticLeftRightMovement)
			{
				ball.dy *= -0.9;
				ball.y = ball.oldY;
			}
			
			//ball.x = ball.oldX - 0.1;
			ball.x = this.ballHolder.x + this.ballHolder.width * 0.5 - ball.radius + 0.1;
			ball.dx = -0.5;
			
			if (!ball.isColRight)
			{
				ball.isColRight = true;
				ball.isColLeft = false;
				const volume = Math.max(0.1, Math.min(1, Math.abs(ball.dx * 0.1)));
				this.playBallCollisionSound(volume);
			}
		}
		else if (isColBottom && diffY >= 1.6 && (!ball.isColRight || !ball.isColLeft))
		{
			const volume = Math.max(0.1, Math.min(1, Math.abs(ball.dy * 0.4)));
			this.playBallCollisionSound(volume);
		}
	}
	
	private checkCollisionColumn(ball: BallModel, column: ColumnModel, nextColumn: ColumnModel | null = null): void
	{
		column.isColLeft = false;
		column.isColRight = false;
		
		if (nextColumn)
		{
			nextColumn.isTestingCollision = true;
			
			nextColumn.isColLeft = this.checkCircleRectCollision(ball, {
				x: nextColumn.x - nextColumn.width * 0.5,
				y: nextColumn.y,
				width: 2 * PachinkoGameConfig.sizeFactor,
				height: nextColumn.height
			});
		}
		else if (column.isTestingCollision)
		{
			column.isColLeft = this.checkCircleRectCollision(ball, {
				x: column.x - column.width * 0.5,
				y: column.y,
				width: 2 * PachinkoGameConfig.sizeFactor,
				height: column.height
			});
		}
		else
		{
			column.isTestingCollision = true; // next time
		}
		
		column.isColRight = this.checkCircleRectCollision(ball, {
			x: column.x + column.width * 0.5 - 2 * PachinkoGameConfig.sizeFactor,
			y: column.y,
			width: 2 * PachinkoGameConfig.sizeFactor,
			height: column.height
		});
		
		if (nextColumn && nextColumn.isColLeft && column.isColRight)
		{
			nextColumn.isTestingCollision = false; // stop next time
			
			// who is next?
			//console.log('r', ball.x + ball.radius + ball.radius, column.x + column.width, nextColumn.x)
			//console.log('ball.radius', ball.radius);
			
			if (ball.x + ball.radius + this.diffBoardX < nextColumn.x)
			{
				nextColumn.isColLeft = false;
				//console.log('isColRight', ball.x, nextColumn.x)
				ball.y -= 1;
			}
			else
			{
				nextColumn.isColRight = false;
				//console.log('isColLeft', ball.x, nextColumn.x)
				ball.y -= 1;
			}
		}
		
		if (column.isColLeft || column.isColRight || nextColumn && nextColumn.isColLeft)
		{
			ball.dy *= -0.9;
			ball.y = ball.oldY;
			if (nextColumn && nextColumn.isColLeft)
			{
				nextColumn.collisionTime = 300;
			}
			else
			{
				column.collisionTime = 300;
			}
			
			if (column.isColLeft || nextColumn && nextColumn.isColLeft)
			{
				//console.log('col left', column.x)
				ball.x = ball.oldX + 0.1;
				if (ball.dy < 0.01)
				{
					ball.dy = -3;
					ball.dx = 1 + Math.random() * 2;
				}
				else
				{
					ball.dx = 0.9 + Math.random() * 0.2;
				}
			}
			else if (column.isColRight)
			{
				//console.log('col right', column.x)
				ball.x = ball.oldX - 0.1;
				if (ball.dy < 0.01)
				{
					ball.dy = -3;
					ball.dx = -1 - Math.random() * 2;
				}
				else
				{
					ball.dx = -0.9 - Math.random() * 0.2;
				}
			}
			
			const volume = Math.max(0.1, Math.min(1, Math.abs(ball.dy * 0.4)));
			this.playBallCollisionSound(volume);
			
			//	this.appLoopService.stop()
		}
	}
	
	private playNailSound(volume: number = 1): void
	{
		const soundNr = Math.floor(Math.random() * 4 + 1);
		this.soundService.playSound('pachinkoNail' + soundNr, true, volume);
	}
	
	private playBallCollisionSound(volume: number = 1): void
	{
		const soundNr = Math.floor(Math.random() * 4 + 1);
		this.soundService.playSound('ballCollision' + soundNr, true, volume);
	}
	
	private checkCircleRectCollision(
		circle: { x: number, y: number, radius: number },
		rect: { x: number, y: number, width: number, height: number }
	): boolean
	{
		// Abstand zwischen dem Ball und dem Rechteck
		const distanceX = Math.abs(circle.x - rect.x - rect.width * 0.5);
		const distanceY = Math.abs(circle.y - rect.y - rect.height * 0.5);
		
		// Überprüfen, ob der Abstand kleiner ist als die Hälfte der Summe der Breiten und Höhen
		if (distanceX > (rect.width * 0.5 + circle.radius))
		{
			return false;
		}
		if (distanceY > (rect.height * 0.5 + circle.radius))
		{
			return false;
		}
		
		if (distanceX <= (rect.width * 0.5))
		{
			return true;
		}
		if (distanceY <= (rect.height * 0.5))
		{
			return true;
		}
		
		const dx = distanceX - rect.width * 0.5;
		const dy = distanceY - rect.height * 0.5;
		
		return (dx * dx + dy * dy <= (circle.radius * circle.radius));
	}
	
	private checkAndGetPoints(ball: any): number
	{
		let collisionColumn = null;
		for (const column of this.columns)
		{
			const collision = ball.x >= column.x - column.width * 0.5 && ball.x <= column.x + column.width * 0.5;
			
			if (collision)
			{
				collisionColumn = column;
				// console.log(ball.x, column.x, column.width)
				break;
			}
		}
		
		if (!collisionColumn)
		{
			if (ball.x < this.boardWidth * 0.5)
			{
				collisionColumn = this.columns[0];
			}
			else
			{
				collisionColumn = this.columns[this.columns.length - 1];
			}
		}
		
		collisionColumn.finishTime = 2000;
		//console.log(collisionColumn)
		return collisionColumn.points;
	}
	
	private loop(delta: number)
	{
		delta = Math.min(17, delta);
		this.update(delta);
		this.draw();
	}
}
