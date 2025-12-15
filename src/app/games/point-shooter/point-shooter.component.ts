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
import {ReleaseButtonModel} from './models/release-button.model';
import {SpringArrowModel} from './models/spring-arrow.model';
import {BallModel} from './models/ball.model';
import {AppLoopService} from '../../core/services/app-loop.service';
import {ImageLoadService} from '../../core/services/image-load.service';
import {SoundService} from '../../core/services/sound.service';
import {NativeTranslateService} from '../../core/services/native-translate.service';
import {UtilTimeout} from '../../shared/utils/util-timeout';
import {MathAngleUtil} from '../../shared/utils/math-angle.util';
import {TargetModel} from './models/target.model';
import {PointShooterGameConfig} from './point-shooter-game.config';
import {BreakPadModel} from './models/break-pad.model';
import {CollisionUtil} from '../../shared/utils/collision.util';
import {AppConfig} from '../../app.config';
import {UtilColor} from '../../shared/utils/util-color';

@Component({
	selector: 'app-point-shooter',
	templateUrl: './point-shooter.component.html',
	styleUrl: './point-shooter.component.scss',
	standalone: false
})
export class PointShooterComponent implements AfterViewInit, OnChanges, OnDestroy
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
	@Input() public targetPoints: Array<number> = [1.1, 1.3, 1.5, 2, 1.1, 1.3, 1.5, 2, 1.1, 1.3, 1.5, 2];
	
	@Input() public borderColor: string = AppConfig.quizGameDefaultMinigameMainColor;
	@Input() public fontColor: string = AppConfig.quizGameDefaultMinigameFontColor;
	@Input() public fontColorTgt: string = AppConfig.quizGameDefaultMinigameFontColor;
	@Input() public colorBg1: string = AppConfig.quizGameDefaultMinigameBackgroundColor1;
	@Input() public colorBg2: string = AppConfig.quizGameDefaultMinigameBackgroundColor2;
	@Input() public buttonColor: string = AppConfig.quizGameDefaultMinigameMainColor;
	@Input() public ballColor: string = AppConfig.quizGameDefaultMinigameBallColor;
	@Input() public ballHoldColor: string = AppConfig.quizGameDefaultMinigameMainColor;
	@Input() public ballHoldColor2: string = AppConfig.quizGameDefaultMinigameMainColor;
	@Input() public ballHoldGumColor: string = AppConfig.quizGameDefaultMinigameMainColor;
	@Input() public ballHoldShotColor: string = AppConfig.quizGameDefaultMinigameBallHolderShotColor;
	@Input() public tgtOutColor: string = AppConfig.quizGameDefaultMinigameTargetBackgroundColor2;
	@Input() public tgtBgColor: string = AppConfig.quizGameDefaultMinigameTargetBackgroundColor2;
	@Input() public tgtBgHoleColor: string = AppConfig.quizGameDefaultMinigameTargetHoleBackgroundColor;
	@Input() public obstArrowColor: string = AppConfig.quizGameDefaultMinigameMainColor;
	@Input() public obstOutColor: string = AppConfig.quizGameDefaultMinigameMainColor;
	@Input() public obstBgColor: string = AppConfig.quizGameDefaultMinigameObstacleBackgroundColor;
	@Input() public obstBgActiveColor: string = AppConfig.quizGameDefaultMinigameBallLightColor;
	
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
	
	protected releaseButton!: ReleaseButtonModel;
	//private releaseButtonText: string = '';
	protected springArrow!: SpringArrowModel;
	protected targets: Array<TargetModel> = [];
	
	protected targetsTop: Array<TargetModel> = [];
	protected targetsBottom: Array<TargetModel> = [];
	protected targetsLeft: Array<TargetModel> = [];
	protected targetsRight: Array<TargetModel> = [];
	
	protected breakPads: Array<BreakPadModel> = [];
	
	protected balls: Array<BallModel> = [];
	
	protected ballHolderColorRGB05: string = UtilColor.getRGBAColorFromHexColor(this.ballHoldColor, 0.5);
	protected ballHolderColor2RGB05: string = UtilColor.getRGBAColorFromHexColor(this.ballHoldColor2, 0.5);
	protected ballHoldGumColorRGB07: string = UtilColor.getRGBAColorFromHexColor(this.ballHoldGumColor, 0.7);
	
	protected ballImage: HTMLImageElement = new Image();
	protected ballHolderImage: HTMLImageElement = new Image();
	protected ballHolderOpenImage: HTMLImageElement = new Image();
	protected borderImage: HTMLImageElement = new Image();
	protected slingshotImage: HTMLImageElement = new Image();
	protected targetImage: HTMLImageElement = new Image();
	protected targetOverlayImage: HTMLImageElement = new Image();
	protected targetHitImage: HTMLImageElement = new Image();
	protected target2Image: HTMLImageElement = new Image();
	protected target2OverlayImage: HTMLImageElement = new Image();
	protected target2HitImage: HTMLImageElement = new Image();
	protected pointShooterBreakPadLeftImage: HTMLImageElement = new Image();
	protected pointShooterBreakPadRightImage: HTMLImageElement = new Image();
	
	protected readonly MathAngleUtil = MathAngleUtil;
	protected readonly Math = Math;
	
	protected readonly appLoopService: AppLoopService = new AppLoopService(this.loop.bind(this));
	
	constructor()
	{
		this.appLoopService.stop();
		this.appLoopService.setRuntime(0);
		this.appLoopService.init('PointShooterComponent', this.ngZone);
		
		if (!AppConfig.areMultiplierGames)
		{
			this.targetPoints = [100, 200, 300, 500, 100, 200, 300, 500, 100, 200, 300, 500];
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
		if ('ballHoldColor' in changes || 'ballHoldColor2' in changes || 'ballHoldGumColor' in changes)
		{
			this.ballHolderColorRGB05 = UtilColor.getRGBAColorFromHexColor(this.ballHoldColor, 0.5);
			this.ballHolderColor2RGB05 = UtilColor.getRGBAColorFromHexColor(this.ballHoldColor2, 0.5);
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
		
		if (PointShooterGameConfig.isUsingImages)
		{
			this.initImages();
		}
		
		const width: number = 160;
		const height: number = 100;
		const margin: number = 10;
		let points: number;
		let x: number = 0;
		let y: number = 50;
		let angle: number = 0;
		let waitTime: number = 0;
		const fullWidth: number = 5 * width + 4 * margin;
		const fullHeight: number = 3 * height + 2 * margin;
		const middleX: number = this.boardWidth * 0.5 - fullWidth * 0.5;
		const minX: number = middleX;
		const minY: number = y;
		const maxX: number = minX + fullWidth - width;
		const maxY: number = minY + fullHeight - height;
		let target: TargetModel;
		
		//console.log('middleX:', middleX);
		//console.log('minX:', minX, 'maxX:', maxX, 'minY:', minY, 'maxY:', maxY);
		
		for (let i = 0, n = this.targetPoints.length; i < n; ++i)
		{
			points = this.targetPoints[i];
			
			if (i > 0 && i < 5)
			{
				x += width + margin;
			}
			else if (i === 5 || i === 6)
			{
				y += height + margin;
			}
			else if (i === 11 || i == 12)
			{
				y -= height + margin;
			}
			else if (i > 6)
			{
				x -= width + margin;
			}
			
			waitTime = 0;
			if (i <= 3)
			{
				angle = 0;
			}
			else if (i <= 5)
			{
				angle = Math.PI * 0.5;
				if (i === 5)
				{
//					waitTime = 6100;
				}
				if (i === 4)
				{
//					waitTime = 12200;
				}
			}
			else if (i <= 9)
			{
				angle = Math.PI;
			}
			else
			{
				angle = -Math.PI * 0.5;
				if (i === 11)
				{
					//				waitTime = 6100;
				}
				if (i === 10)
				{
					//				waitTime = 12200;
				}
			}
			
			target = new TargetModel(
				i,
				x + middleX,
				y,
				width,
				height,
				angle,
				minX, minY, maxX, maxY,
				points
			);
			
			target.waitTime = waitTime;
			if (i >= 4 && i <= 6)
			{
				//	target.waitTime = 10000;
			}
			
			this.targets.push(target);
		}
		this.updateDrawTargets();
		
		let breakPad: BreakPadModel;
		const padWidth: number = 180;
		const padHeight: number = 100;
		
		for (let i = 0; i < 3; ++i)
		{
			breakPad = new BreakPadModel(
				Math.random() * this.boardWidth - padWidth,
				i * 260 + 400,
				padWidth,
				padHeight,
				0,
				this.boardWidth - padWidth,
				0.2 + i * 0.1,
				0.0001,
				Math.round(Math.random()) === 1
			);
			
			this.breakPads.push(breakPad);
		}
		
		this.ballHolder = new BallHolderModel(
			this.boardWidth * 0.5,
			1200,
			this.ballRadius * 2.5,
			this.ballRadius * 2.5
		);
		
		this.releaseButton = new ReleaseButtonModel(
			0, this.boardHeight * 0.82, 240, 240// 500, 200
		);
		this.releaseButton.x = this.boardWidth * 0.5 - this.releaseButton.width * 0.5 + this.diffBoardX;
		//this.releaseButtonText = this.nativeTranslateService.instant('point-shooter-press-and-release');
		
		this.springArrow = new SpringArrowModel(
			this.ballHolder.x,
			this.ballHolder.y + this.ballRadius,
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
		this.soundService.playSound('pointShooterStart', true);
		
		UtilTimeout.setTimeout(
			() => {
				//this.soundService.playSound('pointShooterStart', true);
				this.addBall(this.ballHolder.x, this.ballHolder.y - 70);
				this.changeDetectorRef.detectChanges();
			}, 700
		);
	}
	
	private initImages(): void
	{
		this.setImage('ballImage', 'assets/games/ball-game/images/ball.png');
		this.setImage('ballHolderImage', 'assets/games/ball-game/images/ball-holder.png');
		this.setImage('ballHolderOpenImage', 'assets/games/ball-game/images/ball-holder-open.png');
		this.setImage('borderImage', 'assets/games/ball-game/images/border.png');
		this.setImage('pointShooterSlingshotImage', 'assets/games/point-shooter/images/slingshot.png', 'slingshotImage');
		this.setImage('pointShooterTargetImage', 'assets/games/point-shooter/images/ball-target.png', 'targetImage');
		this.setImage('pointShooterTgtOverImg', 'assets/games/point-shooter/images/ball-target-overlay.png', 'targetOverlayImage');
		this.setImage('pointShooterTargetHitImage', 'assets/games/point-shooter/images/ball-target-hit.png', 'targetHitImage');
		this.setImage('pointShooterTarget2Image', 'assets/games/point-shooter/images/ball-target2.png', 'target2Image');
		this.setImage('pointShooterTarget2OverlayImage', 'assets/games/point-shooter/images/ball-target2-overlay.png', 'target2OverlayImage');
		this.setImage('pointShooterTarget2HitImage', 'assets/games/point-shooter/images/ball-target2-hit.png', 'target2HitImage');
		this.setImage('pointShooterBreakPadLeftImage', 'assets/games/point-shooter/images/break-pad-left.png', 'pointShooterBreakPadLeftImage');
		this.setImage('pointShooterBreakPadRightImage', 'assets/games/point-shooter/images/break-pad-right.png', 'pointShooterBreakPadRightImage');
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
		this.soundService.addSound('pointShooterStart', 'assets/games/point-shooter/sounds/start.mp3');
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
		const isColBallHolder: boolean = CollisionUtil.isCircleInRectangle(
			mousePos.x,
			mousePos.y,
			this.ballHolder.width * 0.5 * window.devicePixelRatio,
			this.ballHolder.x - this.ballHolder.width * 0.5,
			this.ballHolder.y - this.ballHolder.height * 0.5,
			this.ballHolder.width,
			this.ballHolder.height
		);
		
		if (isColBallHolder)
		{
			this.ballHolder.isDragging = true;
			this.ballHolder.dragPosX = this.ballHolder.x;
		}
		
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
		
		if (event.touches.length > 0)
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
		// ball holder
		/*const diffX: number = Math.abs(this.ballHolder.x - this.ballHolder.dragPosX);
		
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
				}*/
		
		this.ballHolder.isDragging = false;
		
		// release button
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
		// event.preventDefault(); // calls warnings in Chrome
		
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
		// button holder
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
		if (this.releaseButton?.isPressed)
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
			Math.PI * 0.5
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
		ball.x = this.ballHolder.x;
		ball.y = this.ballHolder.y;
		ball.viewAngle = 0;// 0.0001;// Math.random() * 0.2 + 0.1;
		
		ball.isReleased = true;
		
		this.startBall.emit();
		this.ballHolder.open();
		
		UtilTimeout.setTimeout(() => {
			this.addBall(this.ballHolder.x, this.ballHolder.y - 70);
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
		
		this.drawTargets();
		this.drawBreakPads();
		
		for (const ball of this.balls)
		{
			if (!ball.isTargetLocked)
			{
				this.drawBall(ball);
			}
		}
		
		this.drawTargetTexts();
		
		//this.drawReleaseButton();
		this.drawSpringArrow();
		
		this.drawBallHolder();
		
		if (this.isDebug)
		{
			this.ctx.fillText(
				this.ballHolder.openTime.toString() + ' ' + this.ballHolder.isDragging + ' ' +
				Math.round(this.ballHolder.dragPosX) + ' ' + Math.round(this.ballHolder.x),
				this.diffBoardX + this.ballHolder.x - this.ballHolder.width * 0.5,
				this.diffBoardY + this.ballHolder.y - this.ballHolder.height * 0.4
			);
		}
		
		if (PointShooterGameConfig.isUsingImages)
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
	}
	
	private updateBall(ball: BallModel, delta: number)
	{
		let breakPad: BreakPadModel;
		let target: TargetModel;
		
		if (ball.isTargetLocked && ball.lockedTarget && ball.targetPos)
		{
			ball.x = ball.lockedTarget.x + ball.targetPos.x;
			ball.y = ball.lockedTarget.y + ball.targetPos.y;
			
			// target ball end position
			const offsetY: number = ball.lockedTarget.points === 2 ? 22 : 22; // 7 : 22
			const dx = ball.lockedTarget.x + ball.lockedTarget.width * 0.5 - ball.x;
			const dy = ball.lockedTarget.y + ball.lockedTarget.height * 0.5 - ball.y + offsetY;
			const distance = Math.sqrt(dx * dx + dy * dy);
			
			if (distance > 3)
			{
				const moveX = (dx / distance) * 0.3 * delta;
				const moveY = (dy / distance) * 0.3 * delta;
				ball.targetPos.x += moveX;
				ball.targetPos.y += moveY;
			}
			
			if (ball.scale > 0.4)
			{
				ball.scale -= delta * 0.001 * ball.scale * 2;
			}
		}
		
		if (ball.isReleased && !ball.isTargetLocked)
		{
			ball.x += ball.speed * Math.cos(ball.angle);
			ball.y += ball.speed * Math.sin(ball.angle);
			
			ball.viewAngle += ball.speed * delta * 0.001;
			
			//ball.speed -= 0.0009 * delta; // friction
			ball.speed -= 0.003 * delta; // friction
			
			// collision detections
			for (let i = 0, n = this.breakPads.length; i < n; ++i)
			{
				breakPad = this.breakPads[i];
				
				if (CollisionUtil.isCircleInRectangle(
					ball.x, ball.y, ball.radius, breakPad.x, breakPad.y, breakPad.width, breakPad.height
				))
				{
					//ball.isTargetLocked = true;
					ball.speed -= delta * breakPad.breakValue;
					
					if (breakPad.isMovingLeft)
					{
						ball.angle -= 0.05 * breakPad.speed * delta;
					}
					else
					{
						ball.angle += 0.05 * breakPad.speed * delta;
					}
					
					ball.angle = Math.max(-Math.PI * 0.8, ball.angle);
					ball.angle = Math.min(-Math.PI * 0.2, ball.angle);
					breakPad.isBallCollision = true;
				}
			}
			for (let i = 0, n = this.targets.length; i < n; ++i)
			{
				target = this.targets[i];
				
				if (CollisionUtil.isCircleInRectangle(
					ball.x, ball.y, ball.radius, target.x, target.y, target.width, target.height * 0.2
				))
				{
					this.finishBallMovement(ball, target);
					break;
					//ball.speed -= delta * breakPad.breakValue;
				}
			}
			
			ball.angle = MathAngleUtil.normalizeAngle(ball.angle);
			
			/*if (ball.speed < 0.0000001)
			{
				this.finishBallMovement(ball, null);
			}*/
		}
	}
	
	private updateTargets(delta: number): void
	{
		let hasDirectionChanged: boolean = false;
		
		let target: TargetModel;
		for (let i = 0, n = this.targets.length; i < n; ++i)
		{
			target = this.targets[i];
			
			target.update(delta);
			
			if (target.hasDirectionChanged)
			{
				hasDirectionChanged = true;
				target.hasDirectionChanged = false;
				
				if (target.angle === Math.PI)
				{
					let nextTarget: TargetModel;
					if (target.index < this.targets.length - 1)
					{
						nextTarget = this.targets[target.index + 1];
					}
					else
					{
						nextTarget = this.targets[0];
					}
					
					target.x = nextTarget.x + nextTarget.width + 10;
				}
			}
		}
		
		if (hasDirectionChanged)
		{
			this.updateDrawTargets();
		}
	}
	
	private updateBreakPads(delta: number): void
	{
		let breakPad: BreakPadModel;
		for (let i = 0, n = this.breakPads.length; i < n; ++i)
		{
			breakPad = this.breakPads[i];
			
			breakPad.update(delta);
		}
	}
	
	private finishBallMovement(ball: BallModel, target: TargetModel | null): void
	{
		let points: number = 0;
		
		ball.isTargetLocked = true;
		
		if (target)
		{
			target.isHit = true;
			points = target.points;
			ball.lockedTarget = target;
			ball.targetPos = {x: ball.x - target.x, y: ball.y - target.y - 20};
		}
		
		// console.log('fin', ball.currentWheelSegmentNumber, ' points: ' + points);
		//ball.lockedWheelAngle = MathAngleUtil.normalizeAngle(ball.currentWheelAngle - this.roulette.angle);
		
		/*const pointSounds: any = {
			2: 'coinTarget05',
		//	1.7: 'coinTarget04',
			1.5: 'coinTarget03',
			1.3: 'coinTarget02',
			1.1: 'coinTarget01'
		};*/
		
		const pointSounds: any = {};
		pointSounds[this.targetPoints[3]] = 'coinTarget05';
		pointSounds[this.targetPoints[2]] = 'coinTarget03';
		pointSounds[this.targetPoints[1]] = 'coinTarget02';
		pointSounds[this.targetPoints[0]] = 'coinTarget01';
		
		if (points in pointSounds)
		{
			this.soundService.playSound(pointSounds[points], true);
		}
		else
		{
			this.soundService.playSound('coinTarget01', true);
		}
		
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
		this.ctx.rotate(ball.angle + Math.PI * 0.5 + ball.viewAngle); // Drehe die Markierung entsprechend dem Winkel des Balls
		
		const ballDiameter: number = (this.ballRadius * 2 + 30) * ball.scale;
		const halfBallDiameter: number = ballDiameter * 0.5;
		
		if (PointShooterGameConfig.isUsingImages)
		{
			this.ctx.drawImage(this.ballImage,
				-halfBallDiameter,
				-halfBallDiameter,
				ballDiameter,
				ballDiameter
			);
		}
		else
		{
			this.ctx.strokeStyle = this.ballColor;// "#ec6a1e";
			this.ctx.lineWidth = 10;
			this.ctx.beginPath();
			
			this.ctx.shadowColor = this.ballColor;//"#ffffff";
			this.ctx.shadowOffsetX = 0; // Horizontal distance of the shadow, in relation to the text.
			this.ctx.shadowOffsetY = 0; // Vertical distance of the shadow, in relation to the text.
			this.ctx.shadowBlur = 8; // Blurring effect to the shadow, the larger the value, the greater the blur.
			
			this.ctx.arc(0, 0, halfBallDiameter * 0.55, 0, 2 * Math.PI);
			this.ctx.stroke();
			
			this.ctx.shadowBlur = 0;
			
			this.ctx.strokeStyle = this.ballColor;//"#ec6a1e";
			this.ctx.lineWidth = 3;
			this.ctx.arc(0, 0, halfBallDiameter * 0.55 - 5, 0, 2 * Math.PI);
			this.ctx.stroke();
			
			this.ctx.shadowBlur = 0;
		}
		
		/*	this.ctx.drawImage(this.ballImage,
				-halfBallDiameter,
				-halfBallDiameter,
				ballDiameter,
				ballDiameter
			);*/
		
		if (this.isDebug)
		{
			// draw ball indicator
			this.ctx.beginPath();
			this.ctx.moveTo(0, -halfBallDiameter * 0.75); // Spitze des Pfeils
			this.ctx.lineTo(-3, 0); // Linke Seite des Pfeils
			this.ctx.lineTo(3, 0); // Rechte Seite des Pfeils
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
		
		/*this.ctx.beginPath();
		 this.ctx.fillStyle = '#4B4BD3FF';
			this.ctx.rect(
			-this.springArrow.width * 0.5,
			-this.springArrow.height * 0.5,
			this.springArrow.width,
			this.springArrow.height
		);
		this.ctx.fill();*/
		
		if (PointShooterGameConfig.isUsingImages)
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
			5, 0,
			Math.PI * 2
		);
		this.ctx.arc(
			this.diffBoardX + this.springArrow.x + this.springArrow.width + 20,
			this.diffBoardY + this.springArrow.startY,
			5, 0,
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
	
	private drawBallHolder(): void
	{
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
		
		if (PointShooterGameConfig.isUsingImages)
		{
			if (this.ballHolderImage && this.ballHolderOpenImage)
			{
				const width: number = this.ballRadius * 6.5 * PointShooterGameConfig.sizeFactor;
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
	
	private updateDrawTargets(): void
	{
		this.targetsTop = [];
		this.targetsBottom = [];
		this.targetsLeft = [];
		this.targetsRight = [];
		
		let target: TargetModel;
		for (let i = 0, n = this.targets.length; i < n; ++i)
		{
			target = this.targets[i];
			
			if (target.angle === Math.PI * 0.5)
			{
				this.targetsRight.push(target);
			}
			else if (target.angle === Math.PI)
			{
				this.targetsBottom.push(target);
			}
			else if (target.angle === -Math.PI * 0.5)
			{
				this.targetsLeft.push(target);
			}
			else
			{
				this.targetsTop.push(target);
			}
		}
	}
	
	private drawTargets(): void
	{
		let target: TargetModel;
		for (let i = 0, n = this.targetsTop.length; i < n; ++i)
		{
			target = this.targetsTop[i];
			this.drawTarget(target);
		}
		
		for (let i = 0, n = this.targetsLeft.length; i < n; ++i)
		{
			target = this.targetsLeft[i];
			this.drawTarget(target);
		}
		
		for (let i = 0, n = this.targetsRight.length; i < n; ++i)
		{
			target = this.targetsRight[i];
			this.drawTarget(target);
		}
		
		for (let i = 0, n = this.targetsBottom.length; i < n; ++i)
		{
			target = this.targetsBottom[i];
			this.drawTarget(target);
		}
	}
	
	private drawTargetTexts(): void
	{
		let target: TargetModel;
		this.ctx.textAlign = 'left'; // horizontal center
		this.ctx.textBaseline = 'middle'; // vertical center
		
		for (let i = 0, n = this.targetsTop.length; i < n; ++i)
		{
			target = this.targetsTop[i];
			this.drawTargetText(target);
		}
		
		for (let i = 0, n = this.targetsLeft.length; i < n; ++i)
		{
			target = this.targetsLeft[i];
			this.drawTargetText(target);
		}
		
		for (let i = 0, n = this.targetsRight.length; i < n; ++i)
		{
			target = this.targetsRight[i];
			this.drawTargetText(target);
		}
		
		for (let i = 0, n = this.targetsBottom.length; i < n; ++i)
		{
			target = this.targetsBottom[i];
			this.drawTargetText(target);
		}
	}
	
	private drawTarget(target: TargetModel): void
	{
		if (PointShooterGameConfig.isUsingImages)
		{
			this.ctx.drawImage(
				target.points === 2 ? this.target2Image : this.targetImage,
				this.diffBoardX + target.x,
				this.diffBoardY + target.y,
				target.width,
				target.height
			);
			
			if (target.isHit)
			{
				this.ctx.drawImage(
					target.points === 2 ? this.target2HitImage : this.targetHitImage,
					this.diffBoardX + target.x,
					this.diffBoardY + target.y,
					target.width,
					target.height
				);
				
				for (const ball of this.balls)
				{
					if (ball.lockedTarget === target)
					{
						this.drawBall(ball);
					}
				}
				
				// draw target overlay
				this.ctx.drawImage(
					target.points === 2 ? this.target2OverlayImage : this.targetOverlayImage,
					this.diffBoardX + target.x,
					this.diffBoardY + target.y,
					target.width,
					target.height
				);
			}
		}
		else
		{
			// draw dark rect in the middle of the target
			this.ctx.fillStyle = this.tgtBgHoleColor;
			
			this.ctx.fillRect(
				this.diffBoardX + target.x,
				this.diffBoardY + target.y,
				target.width,
				target.height
			);
			
			this.ctx.fillStyle = this.tgtBgColor;//'rgba(187,89,240, 0.5)';
			
			const rWidth: number = 40;
			const rHeight: number = 30;
			
			this.ctx.fillRect(this.diffBoardX + target.x, this.diffBoardY + target.y + rHeight, rWidth, target.height - rHeight * 2);
			this.ctx.fillRect(this.diffBoardX + target.x + target.width - rWidth, this.diffBoardY + target.y + rHeight, rWidth, target.height - rHeight * 2);
			this.ctx.fillRect(this.diffBoardX + target.x, this.diffBoardY + target.y, target.width, rHeight);
			this.ctx.fillRect(this.diffBoardX + target.x, this.diffBoardY + target.y + target.height - rHeight, target.width, rHeight);
			
			// draw 4 lines from edge to center block as perspective lines
			/*this.ctx.lineWidth = 2;
			
			this.ctx.strokeStyle = 'rgba(187,89,240, 1)';
			this.ctx.beginPath();
			this.ctx.moveTo(this.diffBoardX + target.x, this.diffBoardY + target.y);
			this.ctx.lineTo(this.diffBoardX + target.x + rWidth, this.diffBoardY + target.y + rHeight);
			
			this.ctx.moveTo(this.diffBoardX + target.x + target.width, this.diffBoardY + target.y);
			this.ctx.lineTo(this.diffBoardX + target.x + target.width - rWidth, this.diffBoardY + target.y + rHeight);
			this.ctx.stroke();
			
			this.ctx.strokeStyle = 'rgba(187,89,240, 0.5)';
			this.ctx.beginPath();
			this.ctx.moveTo(this.diffBoardX + target.x, this.diffBoardY + target.y + target.height);
			this.ctx.lineTo(this.diffBoardX + target.x + rWidth, this.diffBoardY + target.y + target.height - rHeight);
			
			this.ctx.moveTo(this.diffBoardX + target.x + target.width, this.diffBoardY + target.y + target.height);
			this.ctx.lineTo(this.diffBoardX + target.x + target.width - rWidth, this.diffBoardY + target.y + target.height - rHeight);
			this.ctx.stroke();*/
			
			if (target.isHit)
			{
				for (const ball of this.balls)
				{
					if (ball.lockedTarget === target)
					{
						this.drawBall(ball);
						
						this.ctx.fillStyle = this.tgtBgColor;//`rgba(${187 * 0.6},${89 * 0.6},${240 * 0.6}, 1)`;
						//	this.ctx.fillRect(this.diffBoardX + target.x, this.diffBoardY + target.y, 40, target.height);
						//	this.ctx.fillRect(this.diffBoardX + target.x + target.width - 40, this.diffBoardY + target.y, 40, target.height);
						//	this.ctx.fillRect(this.diffBoardX + target.x, this.diffBoardY + target.y, target.width, 30);
						this.ctx.fillRect(this.diffBoardX + target.x, this.diffBoardY + target.y + target.height - 30, target.width, 30);
					}
				}
			}
			
			if (this.tgtBgColor !== this.tgtOutColor)
			{
				this.ctx.strokeStyle = this.tgtOutColor;
				
				this.ctx.beginPath();
				this.ctx.moveTo(this.diffBoardX + target.x, this.diffBoardY + target.y);
				this.ctx.lineTo(this.diffBoardX + target.x + target.width, this.diffBoardY + target.y);
				this.ctx.lineTo(this.diffBoardX + target.x + target.width, this.diffBoardY + target.y + target.height);
				this.ctx.lineTo(this.diffBoardX + target.x, this.diffBoardY + target.y + target.height);
				this.ctx.lineTo(this.diffBoardX + target.x, this.diffBoardY + target.y);
				this.ctx.stroke();
			}
		}
		
		/*this.ctx.font = 'bold 43px Arial';
		this.ctx.fillStyle = '#000000';
		this.ctx.fillText(
			target.points.toString(),
			this.diffBoardX + target.x + target.width * 0.5 - 3,
			this.diffBoardY + target.y + target.height * 0.5 - 10
		);*/
		
		/*this.ctx.font = 'bold 40px Arial';
		this.ctx.fillStyle = '#ffffff';
		this.ctx.fillText(
			target.points.toString(),
			this.diffBoardX + target.x + target.width * 0.5 - 3,
			this.diffBoardY + target.y + target.height * 0.5 - 9
		);*/
		
		if (this.isDebug)
		{
			this.ctx.beginPath();
			this.ctx.fillStyle = '#f00';
			this.ctx.arc(
				this.diffBoardX + target.x,
				this.diffBoardY + target.y,
				10,
				0, Math.PI * 2
			);
			this.ctx.fill();
		}
	}
	
	private drawTargetText(target: TargetModel): void
	{
		/*this.ctx.drawImage(
				target.points === 2 ? this.target2OverlayImage : this.targetOverlayImage,
				this.diffBoardX + target.x,
				this.diffBoardY + target.y,
				target.width,
				target.height
			);*/
		
		/*if (target.isHit)
		{
			this.ctx.drawImage(
				target.points === 2 ? this.target2HitImage : this.targetHitImage,
				this.diffBoardX + target.x,
				this.diffBoardY + target.y,
				target.width,
				target.height
			);
		}*/
		const text: string = target.points.toLocaleString(this.nativeTranslateService.currentLocale ?? 'en-US');
		const textWidth = this.ctx.measureText(text).width;
		
		/*this.ctx.font = 'bold 43px Arial';
		this.ctx.fillStyle = '#000000';
		this.ctx.fillText(
			text,
			this.diffBoardX + target.x + target.width * 0.5 - textWidth * 0.5 - (AppConfig.areMultiplierGames ? 3 : 1),
			this.diffBoardY + target.y + target.height * 0.5 - 3
		);*/
		
		this.ctx.font = 'bold 40px Arial';
		this.ctx.fillStyle = this.fontColorTgt; // '#ffffff';
		this.ctx.fillText(
			text,
			this.diffBoardX + target.x + target.width * 0.5 - textWidth * 0.5 - (AppConfig.areMultiplierGames ? 3 : 1),
			this.diffBoardY + target.y + target.height * 0.5 - 2
		);
		
		if (this.isDebug)
		{
			this.ctx.beginPath();
			this.ctx.fillStyle = '#f00';
			this.ctx.arc(
				this.diffBoardX + target.x,
				this.diffBoardY + target.y,
				10,
				0, Math.PI * 2
			);
			this.ctx.fill();
		}
	}
	
	private drawBreakPads(): void
	{
		let breakPad: BreakPadModel;
		for (let i = 0, n = this.breakPads.length; i < n; ++i)
		{
			breakPad = this.breakPads[i];
			
			if (PointShooterGameConfig.isUsingImages)
			{
				this.ctx.drawImage(
					breakPad.isMovingLeft ? this.pointShooterBreakPadLeftImage : this.pointShooterBreakPadRightImage,
					this.diffBoardX + breakPad.x,
					this.diffBoardY + breakPad.y,
					breakPad.width,
					breakPad.height
				);
			}
			else
			{
				this.ctx.strokeStyle = this.obstOutColor;
				//			this.ctx.font = 'bold 45px Arial';
				//			this.ctx.textAlign = 'center'; // horizontal center
				//			this.ctx.textBaseline = 'middle'; // vertical center
				this.ctx.fillStyle = breakPad.isBallCollision ? this.obstBgActiveColor : this.obstBgColor;// 'rgba(187,89,240, 0.5)';
				this.ctx.fillRect(
					this.diffBoardX + breakPad.x,
					this.diffBoardY + breakPad.y,
					breakPad.width,
					breakPad.height
				);
				
				// set this off directly
				if (breakPad.isBallCollision)
				{
					breakPad.isBallCollision = false;
				}
				
				this.ctx.beginPath();
				this.ctx.moveTo(this.diffBoardX + breakPad.x, this.diffBoardY + breakPad.y);
				this.ctx.lineTo(this.diffBoardX + breakPad.x + breakPad.width, this.diffBoardY + breakPad.y);
				this.ctx.lineTo(this.diffBoardX + breakPad.x + breakPad.width, this.diffBoardY + breakPad.y + breakPad.height);
				this.ctx.lineTo(this.diffBoardX + breakPad.x, this.diffBoardY + breakPad.y + breakPad.height);
				this.ctx.lineTo(this.diffBoardX + breakPad.x, this.diffBoardY + breakPad.y);
				this.ctx.stroke();
				
				// this.ctx.fillStyle = 'rgba(187,89,240, 0.9)';
				
				this.drawBreakPadArrow(breakPad, breakPad.isMovingLeft ? -1 : 1);
			}
			
			if (this.isDebug)
			{
				this.ctx.beginPath();
				this.ctx.fillStyle = '#f00';
				this.ctx.arc(
					this.diffBoardX + breakPad.x,
					this.diffBoardY + breakPad.y,
					10,
					0, Math.PI * 2
				);
				this.ctx.fill();
			}
		}
	}
	
	private drawBreakPadArrow(breakPad: BreakPadModel, sign: number): void
	{
		const centerX: number = breakPad.x + breakPad.width - 40;
		const centerY: number = breakPad.y + 37;
		const wingOffset: number = 5;
		const wingHeight: number = 25;
		const tipOffset: number = 45;
		
		this.ctx.save();
		
		this.ctx.shadowColor = this.obstArrowColor;// "rgba(187,89,240, 0.5)"; // glow
		this.ctx.shadowBlur = 6; // glow width
		this.ctx.lineWidth = 3;
		this.ctx.strokeStyle = this.obstArrowColor;// "rgba(187,89,240, 0.9)";
		
		this.ctx.beginPath();
		
		const sx = centerX - sign * wingOffset;
		const sy = centerY;
		const factor = 20;
		
		this.ctx.moveTo(sx - sign * factor, sy - wingHeight); // start
		this.ctx.lineTo(sx, sy); // inner line middle
		this.ctx.lineTo(sx - sign * factor, sy + wingHeight); // inner line to bottom
		//this.ctx.lineTo(sx + tipOffset * 0.01 * sign, sy + wingHeight); // line at bottom
		this.ctx.lineTo(sx + tipOffset * sign, sy); // line bottom to the tip
		//this.ctx.lineTo(sx + tipOffset * 0.01 * sign, sy - wingHeight); // line from tip to above
		this.ctx.lineTo(sx - sign * factor, sy - wingHeight); // line above to start
		this.ctx.stroke();
		this.ctx.restore();
	}
	
	private update(delta: number)
	{
		for (const ball of this.balls)
		{
			this.updateBall(ball, delta);
		}
		
		this.updateTargets(delta);
		this.updateBreakPads(delta);
		this.releaseButton.update(delta);
		this.ballHolder.update(delta);
		this.springArrow.update(
			delta,
			this.releaseButton.pressFactor,
			this.ballHolder.x
		);
		
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
			/*if (ball.x - ball.radius < 0)
			{
				ball.x = ball.radius * 0.9;
			}
			else
			{
				ball.x = this.boardWidth - ball.radius * 0.9;
			}*/
			const diff = ball.angle + Math.PI * 0.5;
			ball.angle = MathAngleUtil.normalizeAngle((Math.PI * 0.5 + diff) * -1);
		}
	}
	
	private checkCollisionBallHolder(ball: BallModel): void
	{
		if (!this.ballHolder)
		{
			return;
		}
		
		const isColLeft = CollisionUtil.isCircleInRectangle(ball.x, ball.y, ball.radius,
			0, // this.ballHolder.x - this.ballHolder.width * 0.5,
			this.ballHolder.y - this.ballHolder.height * 0.5,
			this.ballHolder.x - this.ballHolder.width * 0.5, // this.boardWidth,//2 * PachinkoGame.sizeFactor,
			this.ballHolder.height
		);
		const isColRight = CollisionUtil.isCircleInRectangle(ball.x, ball.y, ball.radius,
			this.ballHolder.x + this.ballHolder.width * 0.5,
			this.ballHolder.y - this.ballHolder.height * 0.5,
			this.boardWidth, //2 * PachinkoGame.sizeFactor,
			this.ballHolder.height
		);
		const isColBottom = CollisionUtil.isCircleInRectangle(ball.x, ball.y, ball.radius,
			this.ballHolder.x - this.ballHolder.width * 0.5,
			this.ballHolder.y + this.ballHolder.height * 0.5 - 10,
			this.ballHolder.width,
			2
		);
		
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