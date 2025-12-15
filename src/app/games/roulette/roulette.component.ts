import {
	AfterViewInit,
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
import {Point2DInterface} from '../interfaces/point-2D.interface';
import {BallHolderModel} from './models/ball-holder.model';
import {BallModel} from './models/ball.model';
import {AppLoopService} from '../../core/services/app-loop.service';
import {ImageLoadService} from '../../core/services/image-load.service';
import {SoundService} from '../../core/services/sound.service';
import {UtilTimeout} from '../../shared/utils/util-timeout';
import {RouletteModel} from './models/roulette.model';
import {MathAngleUtil} from '../../shared/utils/math-angle.util';
import {ReleaseButtonModel} from './models/release-button.model';
import {SpringArrowModel} from './models/spring-arrow.model';
import {NativeTranslateService} from '../../core/services/native-translate.service';
import {AppConfig} from '../../app.config';
import {RouletteGameConfig} from './roulette-game.config';
import {UtilColor} from '../../shared/utils/util-color';

@Component({
	selector: 'app-roulette',
	templateUrl: './roulette.component.html',
	styleUrl: './roulette.component.scss',
	standalone: false
})
export class RouletteComponent implements AfterViewInit, OnChanges, OnDestroy
{
	private changeDetectorRef = inject(ChangeDetectorRef);
	private imageLoadService = inject(ImageLoadService);
	private soundService = inject(SoundService);
	private nativeTranslateService = inject(NativeTranslateService);
	private ngZone = inject(NgZone);
	
	@ViewChild('game') public game!: ElementRef<HTMLDivElement>;
	@ViewChild('background') public background!: ElementRef<HTMLDivElement>;
	@ViewChild('canvas') public canvas!: ElementRef<HTMLCanvasElement>;
	
	@Input() public ballCount: number = 3;
	@Input() public segmentPoints: Array<number> = [1.1, 1.3, 1.5, 2, 1.1, 1.3, 1.5, 2];
	
	@Input() borderColor: string = AppConfig.quizGameDefaultMinigameMainColor;
	@Input() fontColor: string = AppConfig.quizGameDefaultMinigameFontColor;
	@Input() fontColorTgt: string = AppConfig.quizGameDefaultMinigameFontColor;
	@Input() colorBg1: string = AppConfig.quizGameDefaultMinigameBackgroundColor1;
	@Input() colorBg2: string = AppConfig.quizGameDefaultMinigameBackgroundColor2;
	@Input() buttonColor: string = AppConfig.quizGameDefaultMinigameMainColor;
	@Input() ballColor: string = AppConfig.quizGameDefaultMinigameBallColor;
	@Input() ballHoldGumColor: string = AppConfig.quizGameDefaultMinigameMainColor;
	@Input() ballHoldShotColor: string = AppConfig.quizGameDefaultMinigameBallHolderShotColor;
	@Input() tgtBgColor: string = AppConfig.quizGameDefaultMinigameMainColorA02;
	@Input() tgtBgColor2: string = AppConfig.quizGameDefaultMinigameMainColorA03;
	@Input() tgtOutColor: string = AppConfig.quizGameDefaultMinigameMainColor;
	@Input() tgtBgRollColor: string = AppConfig.quizGameDefaultMinigameMainColorA06;
	@Input() tgtBgLockColor: string = AppConfig.quizGameDefaultMinigameMainColorA08;
	
	@Output() public readonly startBall = new EventEmitter<void>();
	@Output() public readonly finishBall = new EventEmitter<{ score: number, position: Point2DInterface }>();
	@Output() public readonly finishGame = new EventEmitter<boolean>();
	
	public signalGameScale = signal<number>(window.innerWidth / 3840);
	protected signalTopOffsetY = signal<number>(0);
	
	protected isDebug: boolean = false;
	public signalIsReady = signal<boolean>(false);
	
	private ctx!: CanvasRenderingContext2D;
	private touchElement!: HTMLElement;
	
	protected boardWidth: number = 0;
	protected boardHeight: number = 0;
	protected diffBoardX: number = 0;
	protected diffBoardY: number = 0;
	protected ballHolder!: BallHolderModel;
	protected ballRadius: number = 46;
	
	protected ballHoldGumColorRGB07: string = UtilColor.getRGBAColorFromHexColor(this.ballHoldGumColor, 0.7);
	
	protected segmentAngle: number = 2 * Math.PI / this.segmentPoints.length; // segment angle
	
	protected roulette!: RouletteModel;
	protected releaseButton!: ReleaseButtonModel;
	//private releaseButtonText: string = '';
	protected springArrow!: SpringArrowModel;
	
	protected balls: Array<BallModel> = [];
	
	protected ballImage: HTMLImageElement = new Image();
	protected borderImage: HTMLImageElement = new Image();
	protected slingshotImage: HTMLImageElement = new Image();
	protected rouletteWheelImage: HTMLImageElement = new Image();
	protected rouletteWheelSegmentImage: HTMLImageElement = new Image();
	protected rouletteWheelSegmentSelectedImage: HTMLImageElement = new Image();
	
	protected readonly MathAngleUtil = MathAngleUtil;
	protected readonly Math = Math;
	
	protected readonly appLoopService: AppLoopService = new AppLoopService(this.loop.bind(this));
	
	constructor()
	{
		this.appLoopService.stop();
		this.appLoopService.setRuntime(0);
		this.appLoopService.init('RouletteComponent', this.ngZone);
		
		if (!AppConfig.areMultiplierGames)
		{
			this.segmentPoints = [100, 200, 300, 500, 100, 200, 300, 500];
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
		if ('ballHoldGumColor' in changes)
		{
			this.ballHoldGumColorRGB07 = UtilColor.getRGBAColorFromHexColor(this.ballHoldGumColor, 1, 0.7);
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
		
		const clientWidth = this.game.nativeElement.clientWidth;
		const clientHeight = this.game.nativeElement.clientHeight;
		
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
		
		if (RouletteGameConfig.isUsingImages)
		{
			this.initImages();
		}
		
		this.roulette = new RouletteModel(
			this.boardWidth * 0.5,
			this.boardHeight * 0.4,
			400,
			0
		);
		
		this.ballHolder = new BallHolderModel(
			this.roulette.x + this.roulette.radius - this.ballRadius,
			this.roulette.y + this.roulette.radius,
			this.ballRadius * 2.5,
			this.ballRadius * 2.5
		);
		
		this.releaseButton = new ReleaseButtonModel(
			0, this.boardHeight * 0.82, 240, 240// 500, 200
		);
		this.releaseButton.x = this.boardWidth * 0.5 - this.releaseButton.width * 0.5 + this.diffBoardX;
		//this.releaseButtonText = this.nativeTranslateService.instant('point-shooter-press-and-release');
		
		this.springArrow = new SpringArrowModel(
			this.roulette.x + this.roulette.radius - this.ballRadius * 2,
			this.roulette.y + this.roulette.radius + this.ballRadius,
			this.ballRadius * 2,
			this.ballRadius
		);
		
		this.initSounds();
	}
	
	public startGame(): void
	{
		this.addEventListeners();
		
		this.signalIsReady.set(true);
		this.changeDetectorRef.detectChanges();
		
		this.appLoopService.start();
		this.soundService.playSound('rouletteStart', true);
		
		UtilTimeout.setTimeout(
			() => {
				//this.soundService.playSound('rouletteStart', true);
				this.addBall(
					this.roulette.x + this.roulette.radius - this.ballRadius,
					this.roulette.y + this.roulette.radius - 100
				);
				this.changeDetectorRef.detectChanges();
			}, 700
		);
	}
	
	private initImages(): void
	{
		this.setImage('ballImage', 'assets/games/ball-game/images/ball.png');
		this.setImage('borderImage', 'assets/games/ball-game/images/border.png');
		this.setImage('rouletteSlingshotImage', 'assets/games/roulette/images/slingshot.png', 'slingshotImage');
		this.setImage('rouletteWheelImage', 'assets/games/roulette/images/roulette-wheel.png');
		this.setImage('rouletteWheelSegmentImage', 'assets/games/roulette/images/roulette-wheel-segment.png');
		this.setImage('rouletteWheelSegmentSelectedImage', 'assets/games/roulette/images/roulette-wheel-segment-selected.png');
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
		this.soundService.addSound('rouletteStart', 'assets/games/roulette/sounds/start.mp3');
		for (let i = 1; i <= 5; i++)
		{
			this.soundService.addSound('coinTarget0' + i, `assets/games/ball-game/sounds/coin-target0${i}.mp3`);
		}
		for (let i = 1; i <= 4; i++)
		{
			this.soundService.addSound('ballCollision' + i, 'assets/games/ball-game/sounds/ball-collision' + (i < 10 ? '0' : '') + i + '.mp3');
		}
	}
	
	/* prepare events - important for removing all event listeners */
	//private mouseDown = this.onMouseDown.bind(this);
	//private mouseUp = this.onMouseUp.bind(this);
	//private mouseMove = this.onMouseMove.bind(this);
	
	private touchElementTouchStart = this.onTouchElementTouchStart.bind(this);
	//private touchStart = this.onTouchStart.bind(this);
	//private touchMove = this.onTouchMove.bind(this);
	//private touchEnd = this.onTouchEnd.bind(this);
	//private touchCancel = this.onTouchCancel.bind(this);
	
	private addEventListeners(): void
	{
		// mouse events
		//this.touchElement.addEventListener('mousedown', this.mouseDown);
		//window.addEventListener('mouseup', this.mouseUp);
		//this.touchElement.addEventListener('mousemove', this.mouseMove);
		
		// touch events
		this.touchElement.addEventListener('touchstart', this.touchElementTouchStart, {passive: false});
		//this.touchElement.addEventListener('touchstart', this.touchStart);
		//this.touchElement.addEventListener('touchmove', this.touchMove);
		//window.addEventListener('touchend', this.touchEnd);
		//window.addEventListener('touchcancel', this.touchCancel);
	}
	
	private removeEventListeners(): void
	{
		// mouse events
		//this.touchElement?.removeEventListener('mousedown', this.mouseDown);
		//window.removeEventListener('mouseup', this.mouseUp);
		//this.touchElement?.removeEventListener('mousemove', this.mouseMove);
		
		// touch events
		this.touchElement?.removeEventListener('touchstart', this.touchElementTouchStart);
		//this.touchElement?.removeEventListener('touchstart', this.touchStart);
		//this.touchElement?.removeEventListener('touchmove', this.touchMove);
		//window.removeEventListener('touchend', this.touchEnd);
		//window.removeEventListener('touchcancel', this.touchCancel);
	}
	
	private onTouchElementTouchStart(event: TouchEvent): void
	{
		event.preventDefault();
	}
	
	protected onMouseDown(event: MouseEvent): void
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
	
	protected onTouchStart(event: TouchEvent): void
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
		if (!this.releaseButton)
		{
			return;
		}
		
		if (this.isMousePosInsideReleaseButton(mousePos))
		{
			this.soundService.playSound('bowDraw', true, 0.7);
			this.releaseButton.isPressed = true;
		}
	}
	
	protected onMouseUp(event: MouseEvent): void
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
	
	protected onTouchEnd(event: TouchEvent): void
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
		if (!this.releaseButton || !mousePos)
		{
			return;
		}
		
		if (this.releaseButton.isPressed)
		{
			this.releaseButton.isPressed = false;
			this.shootBall(this.releaseButton.pressFactor);
			this.soundService.stopSound('bowDraw');
			this.soundService.playSound('dropIn', true);
			
			this.releaseButton.pressFactor = 0;
			this.changeDetectorRef.detectChanges();
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
		//event.preventDefault();
		
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
			this.shootBall(this.releaseButton.pressFactor);
			
			this.releaseButton.pressFactor = 0;
			this.changeDetectorRef.detectChanges();
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
		if (this.releaseButton.isPressed)
		{
			this.releaseButton.isPressed = false;
			this.shootBall(this.releaseButton.pressFactor);
			
			this.releaseButton.pressFactor = 0;
			this.changeDetectorRef.detectChanges();
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
			this.ballRadius,
			Math.PI * 0.5,
			0.001 + Math.random() * 0.0005
		));
	}
	
	private shootBall(speedFactor: number): void
	{
		let ball: BallModel | null = null;
		
		for (const value of this.balls)
		{
			if (!value.isReleased)
			{
				ball = value;
				break;
			}
		}
		
		if (!ball)
		{
			return;
		}
		
		let speed: number = speedFactor * 25;
		if (speedFactor < 0.2)
		{
			speed = 5 + Math.random() * 5;
		}
		else if (speedFactor >= 1)
		{
			speed += Math.random();
		}
		
		ball.speed = speed;
		ball.angle = Math.PI * 1.5;//  Math.PI * 0;// Math.random() * Math.PI * 2; // Zufälliger Startwinkel
		ball.x = this.roulette.x - this.roulette.radius + this.ballRadius;
		ball.x = this.roulette.x + this.roulette.radius - this.ballRadius;
		ball.y = this.roulette.y + this.roulette.radius;
		ball.viewAngle = 0;// 0.0001;// Math.random() * 0.2 + 0.1;
		
		ball.isReleased = true;
		
		if (ball.speed > 15)
		{
			this.soundService.playSound('rouletteRolling03', true);
		}
		else if (ball.speed > 10)
		{
			this.soundService.playSound('rouletteRolling02', true);
		}
		else
		{
			this.soundService.playSound('rouletteRolling01', true);
		}
		
		this.startBall.emit();
		
		UtilTimeout.setTimeout(() => {
			this.addBall(
				this.roulette.x + this.roulette.radius - this.ballRadius,
				this.roulette.y + this.roulette.radius - 100
			);
		}, 1000);
	}
	
	private removeBall(ball: any)
	{
		this.balls.splice(this.balls.indexOf(ball), 1);
	}
	
	private draw()
	{
		if (!this.ctx || !this.canvas)
		{
			return;
		}
		
		this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
		
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
			this.ctx.strokeStyle = "#da7b06";
			this.ctx.strokeRect(
				this.diffBoardX + this.ballHolder.x - this.ballHolder.width * 0.5,
				this.diffBoardY + this.ballHolder.y - this.ballHolder.height * 0.5 + this.ballHolder.height,
				this.ballHolder.width,
				5
			);
		}
		
		if (RouletteGameConfig.isUsingImages)
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
		
		this.ctx.save();
		this.ctx.translate(this.diffBoardX + this.roulette.x, this.diffBoardY + this.roulette.y);
		this.ctx.rotate(this.roulette.angle + Math.PI * 0.5); // rotate by angle
		
		if (RouletteGameConfig.isUsingImages)
		{
			this.ctx.drawImage(
				this.rouletteWheelImage,
				-this.roulette.radius,
				-this.roulette.radius,
				this.roulette.radius * 2,
				this.roulette.radius * 2
			);
		}
		else
		{
			// draw segments
			for (let i = 0, n = this.segmentPoints.length; i < n; ++i)
			{
				this.ctx.beginPath();
				this.ctx.moveTo(0, 0); // middle point of wheel
				this.ctx.arc(0, 0, this.roulette.radius, i * this.segmentAngle, (i + 1) * this.segmentAngle); // Zeichne das Segment
				this.ctx.closePath();
				
				// different segment colors
				this.ctx.fillStyle = (i % 2 === 0) ? this.tgtBgColor : this.tgtBgColor2;
				this.ctx.fill();
				
				this.ctx.strokeStyle = this.tgtOutColor;// this.colorMainRGB06;
				this.ctx.stroke();
				
				/*
				// center text
				const text = `Faktor ${i + 1}`; // Beispieltext
				this.ctx.fillStyle = this.colorFont; //'#fff'; // Textfarbe
				this.ctx.font = 'bold 26px Arial'; // Schriftart und Größe
				this.ctx.textAlign = 'center'; // Text zentrieren
				this.ctx.textBaseline = 'middle'; // Vertikale Ausrichtung
				
				// calculate position of text
				const textAngle = i * this.segmentAngle + this.segmentAngle / 2; // Mitte des Segments
				const textX =  Math.cos(textAngle) * (this.roulette.radius * 0.6); // Position leicht innen
				const textY =  Math.sin(textAngle) * (this.roulette.radius * 0.6);
				
				// draw text
				this.ctx.fillText(text, textX, textY);*/
			}
		}
		
		this.ctx.restore();
		
		this.ctx.save();
		this.ctx.translate(this.diffBoardX + this.roulette.x, this.diffBoardY + this.roulette.y);
		this.ctx.rotate(this.roulette.angle + Math.PI * 0.5); // Drehe die Markierung entsprechend dem Winkel des Balls
		
		// draw segments
		for (let i = 0, n = this.segmentPoints.length; i < n; ++i)
		{
			for (const ball of this.balls)
			{
				if (ball.currentWheelSegmentNumber === i + 1)
				{
					if (RouletteGameConfig.isUsingImages)
					{
						this.ctx.drawImage(
							ball.isTargetLocked ?
								this.rouletteWheelSegmentSelectedImage :
								this.rouletteWheelSegmentImage,
							0,
							-this.roulette.radius,
							this.roulette.radius,
							this.roulette.radius
						);
					}
					else
					{
						this.ctx.beginPath();
						this.ctx.moveTo(0, 0); // middle point of wheel
						this.ctx.arc(0, 0, this.roulette.radius, -Math.PI * 0.5, -Math.PI * 0.5 + this.segmentAngle); // Zeichne das Segment
						this.ctx.closePath();
						
						// different segment colors
						this.ctx.fillStyle = ball.isTargetLocked ? this.tgtBgLockColor : this.tgtBgRollColor;
						this.ctx.fill();
					}
				}
			}
			
			this.ctx.rotate(this.segmentAngle);
		}
		
		this.ctx.restore();
		
		for (let i = 0, n = this.segmentPoints.length; i < n; ++i)
		{
			const text = (this.isDebug ? `${i + 1}: ` : '') + this.segmentPoints[i].toLocaleString(this.nativeTranslateService.currentLocale ?? 'en-US');
			this.ctx.fillStyle = this.fontColorTgt; //'#fff';
			this.ctx.font = 'bold 45px Arial';
			this.ctx.textAlign = 'center'; // horizontal center
			this.ctx.textBaseline = 'middle'; // vertical center
			const distance: number = this.roulette.radius * 0.62;
			const textAngle = i * this.segmentAngle + this.segmentAngle * 0.5 + this.roulette.angle; // Mitte des Segments
			const textX = this.diffBoardX + this.roulette.x + Math.cos(textAngle) * distance; // Position leicht innen
			const textY = this.diffBoardY + this.roulette.y + Math.sin(textAngle) * distance;
			
			this.ctx.fillText(text, textX, textY);
		}
		
		for (const ball of this.balls)
		{
			this.drawBall(ball);
		}
		
		//	this.drawReleaseButton();
		this.drawSpringArrow();
	}
	
	private updateBall(ball: BallModel, delta: number)
	{
		if (ball.isTargetLocked)
		{
			const distanceFromCenter = Math.sqrt((ball.x - this.roulette.x) ** 2 + (ball.y - this.roulette.y) ** 2);
			const angleDifference = MathAngleUtil.normalizeAngle(ball.lockedWheelAngle + this.roulette.angle);// - this.roulette.angle;
			
			// Berechne die neue Position des Balls
			ball.x = this.roulette.x + Math.cos(angleDifference) * distanceFromCenter;
			ball.y = this.roulette.y + Math.sin(angleDifference) * distanceFromCenter;
		}
		
		if (ball.isReleased && !ball.isTargetLocked)
		{
			ball.x += ball.speed * Math.cos(ball.angle);
			ball.y += ball.speed * Math.sin(ball.angle);
			
			ball.viewAngle += ball.speed * delta * 0.001;
			
			//ball.speed -= 0.0009 * delta; // friction
			ball.speed -= 0.003 * delta; // friction
			
			ball.currentWheelAngle = Math.atan2(
				ball.y - this.roulette.y,
				ball.x - this.roulette.x
			);
			// calculate ball at wheel factor
			const currentWheelSegmentNumber = this.getCurrentBallSegmentNumber(ball);
			
			if (ball.currentWheelSegmentNumber !== currentWheelSegmentNumber)
			{
				ball.currentWheelSegmentNumber = currentWheelSegmentNumber;
				this.soundService.playSound('rouletteStep', true, 0.3);
			}
			
			if (ball.isInsideWheel)
			{
				this.handleWallCollision(ball, delta);
			}
			else if (!ball.isInsideWheel && this.isBallInsideTable(ball))
			{
				ball.isInsideWheel = true;
			}
			
			ball.angle = MathAngleUtil.normalizeAngle(ball.angle);
			
			if (ball.speed < 0.0000001)
			{
				this.finishBallMovement(ball);
			}
		}
	}
	
	private finishBallMovement(ball: BallModel): void
	{
		const points: number = this.segmentPoints[ball.currentWheelSegmentNumber - 1];
		
		// console.log('fin', ball.currentWheelSegmentNumber, ' points: ' + points);
		ball.isTargetLocked = true;
		ball.lockedWheelAngle = MathAngleUtil.normalizeAngle(ball.currentWheelAngle - this.roulette.angle);
		
		const pointSounds: any = {};
		pointSounds[this.segmentPoints[4]] = 'coinTarget05';
		pointSounds[this.segmentPoints[3]] = 'coinTarget04';
		pointSounds[this.segmentPoints[2]] = 'coinTarget03';
		pointSounds[this.segmentPoints[1]] = 'coinTarget02';
		pointSounds[this.segmentPoints[0]] = 'coinTarget01';
		
		/*const pointSounds: any = {
			2: 'coinTarget05',
			1.7: 'coinTarget04',
			1.5: 'coinTarget03',
			1.3: 'coinTarget02',
			1.1: 'coinTarget01'
		};*/
		if (points in pointSounds)
		{
			this.soundService.playSound(pointSounds[points], true, 0.5);
		}
		else
		{
			this.soundService.playSound('coinTarget01', true, 0.5);
		}
		this.soundService.playSound('rouletteLogin', true, 0.7);
		this.soundService.playSound('rouletteLock', true);
		
		const position: Point2DInterface = {x: ball.x, y: ball.y};
		
		this.finishBall.emit({score: points, position: position});
		
		// check if game is finished
		if (this.ballCount <= 0)
		{
			let areAllButtonsLocked: boolean = true;
			for (const ball of this.balls)
			{
				if (!ball.isTargetLocked)
				{
					areAllButtonsLocked = false;
				}
			}
			
			// finish game
			if (areAllButtonsLocked)
			{
				this.finishGame.emit(true);
				
				UtilTimeout.setTimeout(() => {
					this.signalIsReady.set(false);
				}, 1100);
			}
		}
	}
	
	private getCurrentBallSegmentNumber(ball: BallModel): number
	{
		// take angle in range of [0, 2 * PI]
		let angle = ball.currentWheelAngle - this.roulette.angle;
		if (angle < 0)
		{
			angle += 2 * Math.PI;
		}
		
		return Math.floor(angle / this.segmentAngle) + 1;
	}
	
	private handleWallCollision(ball: BallModel, delta: number)
	{
		const angleToWall = Math.atan2(
			ball.y - this.roulette.y,
			ball.x - this.roulette.x
		);
		const distanceFromCenter = Math.sqrt(
			(ball.x - this.roulette.x) ** 2 +
			(ball.y - this.roulette.y) ** 2
		);
		const wallNormalAngle = (angleToWall - Math.PI * 0.5); // normal angle to roulette wall
		const angleDifference = MathAngleUtil.normalizeAngle(ball.angle - wallNormalAngle); // calculate the difference
		
		// Überprüfe, ob der Ball nahe an der Wand ist
		if (this.isBallAtTableWall(distanceFromCenter))
		{
			// Sanfte Anpassung des Winkels
			if (Math.abs(angleDifference) > Math.PI * 0.35)
			{ // steiler Winkel
				// console.log('hard', Math.abs(angleDifference), Math.PI * 0.35)
				
				ball.angle = wallNormalAngle - angleDifference;
			}
			else
			{
				//console.log(Math.abs(angleDifference), Math.PI * 0.25)
				ball.angle -= angleDifference * 0.5; //  adjust angle for steep impact
			}
			
			// clamp ball inside roulette circle
			const overlap = (distanceFromCenter + this.ballRadius) - this.roulette.radius;
			if (overlap > 0)
			{
				ball.x -= overlap * Math.cos(angleToWall);
				ball.y -= overlap * Math.sin(angleToWall);
			}
		}
		
		// Funnel effect: move the ball gently towards the center and adjust the angle
		if (ball.speed < 20)
		{
			// adjust the angle towards the center
			const angleToCenter = Math.atan2(this.roulette.y - ball.y, this.roulette.x - ball.x);
			const angleAdjustment = MathAngleUtil.normalizeAngle(angleToCenter - ball.angle);
			ball.angle += MathAngleUtil.normalizeAngle(angleAdjustment + Math.PI * 0.5 - Math.PI * ball.fallAngle * delta); // Sanfte Anpassung des Winkels
		}
	}
	
	private isBallAtTableWall(distanceFromCenter: number): boolean
	{
		return distanceFromCenter + this.ballRadius >= this.roulette.radius;
	}
	
	private isBallInsideTable(ball: BallModel): boolean
	{
		const distanceFromCenter =
			Math.sqrt(
				(ball.x - this.roulette.x) ** 2 +
				(ball.y - this.roulette.y) ** 2
			); // calculate distance to midpoint
		
		return distanceFromCenter + this.ballRadius <= this.roulette.radius + 1;
	}
	
	private drawBall(ball: BallModel): void
	{
		// draw ball
		/*this.ctx.beginPath();
		this.ctx.arc(this.diffBoardX + this.ballX, this.diffBoardY + this.ballY, this.ballRadius, 0, Math.PI * 2);
		this.ctx.fillStyle = 'red';
		this.ctx.fill();
		this.ctx.closePath();*/
		
		this.ctx.save();
		this.ctx.translate(this.diffBoardX + ball.x, this.diffBoardY + ball.y);
		this.ctx.rotate(ball.angle + Math.PI / 2 + ball.viewAngle); // rotate mark with a ball angle
		
		if (RouletteGameConfig.isUsingImages)
		{
			this.ctx.drawImage(this.ballImage,
				-this.ballRadius - 15,
				-this.ballRadius - 15,
				this.ballRadius * 2 + 30,
				this.ballRadius * 2 + 30
			);
		}
		else
		{
			this.ctx.strokeStyle = this.ballColor;//"#ec6a1e";
			this.ctx.lineWidth = 10;
			this.ctx.beginPath();
			
			this.ctx.shadowColor = this.ballColor;//"#ffffff";
			this.ctx.shadowOffsetX = 0; // Horizontal distance of the shadow, in relation to the text.
			this.ctx.shadowOffsetY = 0; // Vertical distance of the shadow, in relation to the text.
			this.ctx.shadowBlur = 8; // Blurring effect to the shadow, the larger the value, the greater the blur.
			
			this.ctx.arc(0, 0, ball.radius - 5, 0, 2 * Math.PI);
			this.ctx.stroke();
			
			this.ctx.shadowBlur = 0;
			
			this.ctx.strokeStyle = this.ballColor;//"#ec6a1e";
			this.ctx.lineWidth = 3;
			this.ctx.arc(0, 0, ball.radius - 5, 0, 2 * Math.PI);
			this.ctx.stroke();
			
			this.ctx.shadowBlur = 0;
		}
		
		if (this.isDebug)
		{
			// draw ball indicator
			this.ctx.beginPath();
			this.ctx.moveTo(0, -this.ballRadius); // Spitze des Pfeils
			this.ctx.lineTo(-3, -this.ballRadius + 50); // Linke Seite des Pfeils
			this.ctx.lineTo(3, -this.ballRadius + 50); // Rechte Seite des Pfeils
			this.ctx.closePath();
			this.ctx.fillStyle = '#fff';
			this.ctx.fill();
		}
		
		this.ctx.restore();
		
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
	
	/*private drawReleaseButton(): void
	{
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
		
		this.ctx.strokeStyle = this.releaseButton.isPressed ? "#b76cdc" : "#8a3cb1";
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
		
		const x: number = this.diffBoardX + this.releaseButton.x + this.releaseButton.width * 0.5;
		const y: number = this.diffBoardY + this.releaseButton.y + this.releaseButton.height * 0.5;
		const maxWidth: number = this.releaseButton.width * 0.8; // padding inside the rect
		const lineHeight: number = 45;
		CanvasContextUtil.drawWrappedText(this.ctx, this.releaseButtonText, x, y, maxWidth, lineHeight);
	}*/
	
	private drawSpringArrow(): void
	{
		//this.ctx.beginPath();
		//this.ctx.strokeStyle = '#aaa';
		//this.ctx.lineWidth = 5;
		//this.ctx.stroke();
		
		this.ctx.save();
		
		this.ctx.translate(
			this.diffBoardX + this.springArrow.x + this.springArrow.width * 0.5,
			this.diffBoardY + this.springArrow.y + this.springArrow.height * 0.5
		);
		this.ctx.rotate(this.springArrow.angle);
		
		if (RouletteGameConfig.isUsingImages)
		{
			this.ctx.drawImage(
				this.slingshotImage,
				-this.springArrow.width * 0.5,
				-this.springArrow.height * 0.5,
				this.springArrow.width,
				this.springArrow.height
			);
		}
		else
		{
			this.ctx.beginPath();
			this.ctx.fillStyle = this.ballHoldShotColor;
			this.ctx.rect(
				-this.springArrow.width * 0.5,
				-this.springArrow.height * 0.5,
				this.springArrow.width,
				this.springArrow.height * 0.6
			);
			this.ctx.fill();
		}
		
		this.ctx.restore();
		
		// rubber bands
		this.ctx.strokeStyle = this.ballHoldGumColorRGB07;
		this.ctx.beginPath();
		this.ctx.moveTo(
			this.diffBoardX + this.springArrow.x - 20,
			this.diffBoardY + this.springArrow.startY
		);
		this.ctx.lineTo(
			this.diffBoardX + this.springArrow.x + 3,
			this.diffBoardY + this.springArrow.y + this.springArrow.height * 0.5
		);
		this.ctx.stroke();
		
		this.ctx.beginPath();
		this.ctx.moveTo(
			this.diffBoardX + this.springArrow.x + this.springArrow.width + 20,
			this.diffBoardY + this.springArrow.startY
		);
		this.ctx.lineTo(
			this.diffBoardX + this.springArrow.x + this.springArrow.width - 3,
			this.diffBoardY + this.springArrow.y + this.springArrow.height * 0.5
		);
		this.ctx.stroke();
		
		this.ctx.beginPath();
		this.ctx.arc(
			this.diffBoardX + this.springArrow.x - 20,
			this.diffBoardY + this.springArrow.startY,
			10, 0,
			Math.PI * 2
		);
		this.ctx.arc(
			this.diffBoardX + this.springArrow.x + this.springArrow.width + 20,
			this.diffBoardY + this.springArrow.startY,
			10, 0,
			Math.PI * 2
		);
		
		// dots at rubber bands
		this.ctx.fillStyle = this.ballHoldGumColor;// '#8a3cb1';
		this.ctx.fill();
		this.ctx.closePath();
		
		this.ctx.beginPath();
		this.ctx.arc(
			this.diffBoardX + this.springArrow.x - 20,
			this.diffBoardY + this.springArrow.startY,
			3, 0,
			Math.PI * 2
		);
		this.ctx.arc(
			this.diffBoardX + this.springArrow.x + this.springArrow.width + 20,
			this.diffBoardY + this.springArrow.startY,
			3, 0,
			Math.PI * 2
		);
		this.ctx.fillStyle = this.ballHoldGumColor;// '#582671';
		this.ctx.fill();
		this.ctx.closePath();
	}
	
	private update(delta: number)
	{
		for (const ball of this.balls)
		{
			this.updateBall(ball, delta);
		}
		
		this.roulette.update(delta);
		this.releaseButton.update(delta);
		this.springArrow.update(delta, this.releaseButton.pressFactor);
		
		for (const ball of this.balls)
		{
			ball.update(delta);
			
			this.checkCollisionBallWallBorder(ball);
			
			if (ball.y - ball.radius > this.boardHeight)
			{
				//ball.dy = -ball.dy * 0.6;
				/*const points: number = this.checkAndGetPoints(ball);
				const pointSounds: any = {
					10: 'coinTarget05',
					8: 'coinTarget04',
					6: 'coinTarget03',
					4: 'coinTarget02',
					2: 'coinTarget01'
				};
				if (points in pointSounds)
				{
					this.soundService.playSound(pointSounds[points], true);
				}
				else
				{
					this.soundService.playSound('coinTarget01', true);
				}*/
				
				const position: Point2DInterface = {x: ball.x, y: ball.y};
				
				this.removeBall(ball);
				const points = 0;
				this.finishBall.emit({score: points, position: position});
				
				// finishGame
				if (this.balls.length <= 0)
				{
					this.finishGame.emit(true);
				}
			}
			
			if (!ball.isReleased)
			{
				this.checkCollisionBallHolder(ball);
			}
		}
		
		if (this.releaseButton.isPressed)
		{
			this.changeDetectorRef.detectChanges();
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
		const isColBottom = this.checkCircleRectCollision(ball, {
			x: this.ballHolder.x - this.ballHolder.width * 0.5,
			y: this.ballHolder.y + this.ballHolder.height * 0.5 - 10,
			width: this.ballHolder.width,
			height: 2
		});
		
		const diffY = Math.abs(ball.y - ball.oldY);
		
		if (isColBottom)
		{
			ball.dy *= -0.9;
			ball.y = ball.oldY;
		}
		
		if (isColLeft)
		{
			ball.dy *= -0.9;
			ball.y = ball.oldY;
			
			//ball.x = ball.oldX + 0.1;
			ball.x = this.ballHolder.x - this.ballHolder.width * 0.5 + ball.radius + 0.1;
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
			ball.dy *= -0.9;
			ball.y = ball.oldY;
			
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
		// distance between ball and rect
		const distanceX = Math.abs(circle.x - rect.x - rect.width * 0.5);
		const distanceY = Math.abs(circle.y - rect.y - rect.height * 0.5);
		
		// check if distance is smaller than half of sum of widths and heights
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
	
	private loop(delta: number)
	{
		delta = Math.min(17, delta);
		this.update(delta);
		this.draw();
		
		if (this.isDebug)
		{
			this.changeDetectorRef.detectChanges();
		}
	}
}
