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
	OnDestroy,
	Output,
	ViewChild
} from '@angular/core';
import {GameService} from './services/game.service';
import {RectModel} from './models/rect.model';
import {TargetRectModel} from './models/target-rect.model';
import {MathAngleUtil} from '../../shared/utils/math-angle.util';
import {ShapeSlingshotGameConfig} from './shape-slingshot-game.config';
import {Point2DInterface} from '../interfaces/point-2D.interface';
import {TouchPosModel} from './models/touch-pos.model';
import {AppLoopService} from '../../core/services/app-loop.service';
import {SoundService} from '../../core/services/sound.service';
import {UtilTimeout} from '../../shared/utils/util-timeout';
import {CardTargetStateEnum} from './enums/card-target-state.enum';
import {FileLoadService} from '../../core/services/file-load.service';
import {LocaleEnum} from '../../shared/enums/locale.enum';
import {ToastTypeEnum} from '../../shared/modules/toast/toast-type-enum';
import {ToastService} from '../../shared/modules/toast/toast.service';

@Component({
	selector: 'app-shape-slingshot',
	templateUrl: './shape-slingshot.component.html',
	styleUrls: ['./shape-slingshot.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default,
	standalone: false
})
export class ShapeSlingshotComponent implements AfterViewInit, OnDestroy
{
	private fileLoadService = inject(FileLoadService);
	private soundService = inject(SoundService);
	private toastService = inject(ToastService);
	private changeDetectorRef = inject(ChangeDetectorRef);
	
	@ViewChild('shapeSlingshotGame') public shapeSlingshotGame!: ElementRef<HTMLDivElement>;
	@ViewChild('canvas') public canvas?: ElementRef<HTMLCanvasElement>;
	@ViewChild('game') public game!: ElementRef<HTMLDivElement>;
	@ViewChild('board') public board!: ElementRef<HTMLDivElement>;
	
	@Input({required: true}) public gameConfigUrl!: string;
	
	@Output() public readonly finishGame = new EventEmitter<{ isSuccess: boolean, runtime: number }>();
	
	protected readonly CardTargetStateEnum = CardTargetStateEnum;
	protected readonly LocaleEnum = LocaleEnum;
	
	public isDebug: boolean = false;
	public rects: Array<RectModel> = [];
	public targetRects: Array<TargetRectModel> = [];
	protected readonly MathAngleUtil = MathAngleUtil;
	protected readonly Math = Math;
	
	private ctx?: CanvasRenderingContext2D;
	private touchElement!: HTMLElement;
	
	private gameService: GameService = new GameService();
	private boardWidth: number = 0;
	private boardHeight: number = 0;
	private diffBoardX: number = 0;
	private diffBoardY: number = 0;
	
	private config: any = {};
	private windowWidthFactor: number = window.innerWidth / 3840;
	
	private readonly appLoopService: AppLoopService = new AppLoopService(this.loop.bind(this));
	
	constructor()
	{
		this.appLoopService.stop();
		this.appLoopService.setRuntime(0);
		this.appLoopService.init('ShapeSlingshotComponent');
	}
	
	public ngAfterViewInit(): void
	{
		this.init();
	}
	
	public ngOnDestroy(): void
	{
		this.appLoopService.stop();
		this.removeEventListeners();
	}
	
	@HostListener('window:resize', [])
	public onResize(): void
	{
		const canvas: HTMLCanvasElement | undefined = this.canvas?.nativeElement;
		const touchElement: HTMLElement = this.touchElement;
		const windowWidth: number = touchElement.clientWidth; // window.innerWidth;
		let windowHeight: number = touchElement.clientHeight; // window.innerHeight - this.shapeSlingshotGame.nativeElement.offsetTop;
		
		// happens at start that windowHeight is 0, so it needs to be calculated
		if (windowWidth && windowHeight === 0)
		{
			windowHeight = windowWidth * 3 / 4 - this.shapeSlingshotGame.nativeElement.offsetTop;
		}
		
		const oldWindowWidthFactor: number = this.windowWidthFactor;
		this.windowWidthFactor = windowWidth / 2160;
		
		if (canvas)
		{
			canvas.width = windowWidth;
			canvas.height = windowHeight;
		}
		
		this.boardWidth = windowWidth;
		this.boardHeight = windowHeight;
		
		if (this.canvas)
		{
			this.diffBoardX = this.canvas.nativeElement.width * 0.5 - this.boardWidth * 0.5;
			this.diffBoardY = this.canvas.nativeElement.height * 0.5 - this.boardHeight * 0.5;
		}
		else
		{
			this.diffBoardX = 0;
			this.diffBoardY = 0;
		}
		
		let rect: RectModel;
		let target: TargetRectModel;
		
		// update all x,y,width & heights in targets and cards by windowWidthFactor
		for (let i = 0; i < this.targetRects.length; i++)
		{
			target = this.targetRects[i];
			target.x = target.x / oldWindowWidthFactor * this.windowWidthFactor;
			target.y = target.y / oldWindowWidthFactor * this.windowWidthFactor;
			target.width = target.width / oldWindowWidthFactor * this.windowWidthFactor;
			target.height = target.height / oldWindowWidthFactor * this.windowWidthFactor;
			target.halfWidth = target.width * 0.5;
			target.halfHeight = target.height * 0.5;
			
			target.update();
		}
		
		for (let i = 0; i < this.rects.length; i++)
		{
			rect = this.rects[i];
			rect.startPos.x = rect.startPos.x / oldWindowWidthFactor * this.windowWidthFactor;
			rect.startPos.y = rect.startPos.y / oldWindowWidthFactor * this.windowWidthFactor;
			rect.x = rect.x / oldWindowWidthFactor * this.windowWidthFactor;
			rect.y = rect.y / oldWindowWidthFactor * this.windowWidthFactor;
			rect.width = rect.width / oldWindowWidthFactor * this.windowWidthFactor;
			rect.height = rect.height / oldWindowWidthFactor * this.windowWidthFactor;
			rect.halfWidth = rect.width * 0.5;
			rect.halfHeight = rect.height * 0.5;
			rect.touchPositions = [];
			rect.wasTouchPos1Removed = false;
			rect.wasTouchPos2Removed = false;
			
			if (rect.targetPos)
			{
				rect.targetPos.x = rect.targetPos.x / oldWindowWidthFactor * this.windowWidthFactor;
				rect.targetPos.y = rect.targetPos.y / oldWindowWidthFactor * this.windowWidthFactor;
			}
			
			for (const value of rect.specialTargets)
			{
				value.x = value.x / oldWindowWidthFactor * this.windowWidthFactor;
				value.y = value.y / oldWindowWidthFactor * this.windowWidthFactor;
			}
			
			rect.hasMoved = true;
			
			// check card at the border
			if (rect.x + rect.halfWidth < 0)
			{
				rect.x = rect.halfWidth;
			}
			else if (rect.x + rect.halfWidth > this.boardWidth)
			{
				rect.x = this.boardWidth - rect.halfWidth;
			}
			if (rect.y + rect.halfHeight < 0)
			{
				rect.y = rect.halfHeight;
			}
			else if (rect.y + rect.halfHeight > this.boardHeight)
			{
				rect.y = this.boardHeight - rect.halfHeight;
			}
			
			rect.update(0.00001, 0.00001, this.boardWidth, this.boardHeight);
		}
		
		this.changeDetectorRef.markForCheck();
	}
	
	// private targetRectsInRange: Array<TargetRectModel> = [];
	public init(): void
	{
		if (this.canvas)
		{
			this.ctx = this.canvas.nativeElement.getContext("2d") as CanvasRenderingContext2D;
		}
		this.touchElement = this.board.nativeElement;
		
		this.initGame().then();
	}
	
	public async initGame()
	{
		let blobsJson: any = [];
		
		try
		{
			blobsJson = await this.fileLoadService.loadFiles([
				this.gameConfigUrl
			]);
		}
		catch (err: any)
		{
			this.toastService.showToast(err, ToastTypeEnum.error, 30000);
		}
		
		if (blobsJson[0] && blobsJson[0].type.indexOf('application/json') !== -1)
		{
			const jsonText = await blobsJson[0].text();
			this.config = JSON.parse(jsonText);
		}
		
		this.onResize();
		UtilTimeout.setTimeout(
			() => {
				this.onResize();
			}, 300
		);
		
		this.addEventListeners();
		this.startGame();
	}
	
	/* prepare events - important for removing all event listeners */
	private mouseDown = this.onMouseDown.bind(this);
	private mouseUp = this.onMouseUp.bind(this);
	private mouseWheel = this.onMouseWheel.bind(this);
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
		this.touchElement.addEventListener('wheel', this.mouseWheel);
		window.addEventListener('mousemove', this.mouseMove);
		
		// touch events
		this.touchElement.addEventListener('touchstart', this.touchElementTouchStart, {passive: false});
		window.addEventListener('touchstart', this.touchStart);
		window.addEventListener('touchmove', this.touchMove);
		window.addEventListener('touchend', this.touchEnd);
		window.addEventListener('touchcancel', this.touchCancel);
	}
	
	private removeEventListeners(): void
	{
		// mouse events
		this.touchElement?.removeEventListener('mousedown', this.mouseDown);
		window.removeEventListener('mouseup', this.mouseUp);
		this.touchElement?.removeEventListener('wheel', this.mouseWheel);
		window.removeEventListener('mousemove', this.mouseMove);
		
		// touch events
		this.touchElement?.removeEventListener('touchstart', this.touchElementTouchStart);
		window.removeEventListener('touchstart', this.touchStart);
		window.removeEventListener('touchmove', this.touchMove);
		window.removeEventListener('touchend', this.touchEnd);
		window.removeEventListener('touchcancel', this.touchCancel);
	}
	
	private onTouchElementTouchStart(event: TouchEvent): void
	{
		event.preventDefault();
	}
	
	private startGame(): void
	{
		this.addCardsToBoard();
		this.addTargetsToBoard();
		
		this.appLoopService.start();
	}
	
	private addCardsToBoard(): void
	{
		this.rects = [];
		for (let i = 0; i < this.config.rects.length; i++)
		{
			const rect = this.config.rects[i];
			
			const rectModel: RectModel = new RectModel(
				this.gameService,
				rect.id ?? '',
				rect.targetIds ?? [],
				parseInt(rect.x, 10) * this.windowWidthFactor,
				parseInt(rect.y, 10) * this.windowWidthFactor,
				parseInt(rect.width, 10) * this.windowWidthFactor,
				parseInt(rect.height, 10) * this.windowWidthFactor,
				parseFloat(rect.angle),
				(targetState: CardTargetStateEnum) => {
					// console.log(targetState); // 0 = 'not-at-target', 1 = 'valid-target', -1 = 'invalid-target'
					if (targetState === CardTargetStateEnum.validTarget)
					{
						this.soundService.playSound('shapeSlingshotCardLock', true);
					}
					else if (targetState === CardTargetStateEnum.invalidTarget)
					{
						this.soundService.playSound('shapeSlingshotCardLockInvalid', true);
					}
				}
			);
			if ('specialTargets' in rect)
			{
				for (const value of rect.specialTargets)
					rectModel.specialTargets.push(
						{
							id: value.id ?? '',
							x: parseInt(value.x, 10) * this.windowWidthFactor,
							y: parseInt(value.y, 10) * this.windowWidthFactor,
							angle: parseFloat(value.angle)
						}
					)
			}
			if ('styles' in rect)
			{
				rectModel.style = {};
				for (const key in rect.styles)
				{
					rectModel.style[key] = rect.styles[key];
				}
			}
			
			rectModel.angleDegrees = MathAngleUtil.radiansToDegrees(rectModel.angle);
			rectModel.zIndex = i + ShapeSlingshotGameConfig.DIV_MIN_Z_INDEX;
			rectModel.text = rect.text;
			rectModel.textKey = rect.textKey;
			this.rects.push(rectModel);
		}
	}
	
	private addTargetsToBoard(): void
	{
		this.targetRects = [];
		for (let i = 0; i < this.config.targets.length; i++)
		{
			const rect = this.config.targets[i];
			const rectModel: TargetRectModel = new TargetRectModel(
				rect.id ?? '',
				parseInt(rect.x, 10) * this.windowWidthFactor,
				parseInt(rect.y, 10) * this.windowWidthFactor,
				parseInt(rect.width, 10) * this.windowWidthFactor,
				parseInt(rect.height, 10) * this.windowWidthFactor,
				parseFloat(rect.angle)
			);
			rectModel.angleDegrees = MathAngleUtil.radiansToDegrees(rectModel.angle);
			rectModel.zIndex = i + ShapeSlingshotGameConfig.TARGET_DIV_MIN_Z_INDEX;
			rectModel.text = rect.text;
			rectModel.textKey = rect.textKey;
			this.targetRects.push(rectModel);
		}
	}
	
	/*private drawRect(rect: RectModel)
	{
		this.ctx!.save(); // speichert den aktuellen Kontext
		this.ctx!.translate(rect.x + rect.w / 2, rect.y + rect.h / 2); // verschiebt den Kontext zum Mittelpunkt des Rechtecks
		this.ctx!.rotate(rect.angle); // dreht den Kontext um den Winkel des Rechtecks
		this.ctx!.strokeStyle = "rgb(255, 0, 0)";
		this.ctx!.fillStyle = "blue";
		this.ctx!.fillRect(-rect.w / 2, -rect.h / 2, rect.w, rect.h); // zeichnet das Rechteck von der linken oberen Ecke aus
		this.ctx!.stroke();
		this.ctx!.restore(); // stellt den Kontext auf den vorherigen Zustand wieder her
	}*/
	
	private draw()
	{
		if (!this.isDebug || !this.canvas || !this.ctx)
		{
			return;
		}
		
		const ctx = this.ctx;
		let card: RectModel;
		
		ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
		// polyfill for Android Chrome - clearRect is not working without
		ctx.fillStyle = "#fff1";
		ctx.fillRect(0, 0, 1, 1);
		
		/*ctx.clearRect(0, 0, canvas.width, canvas.height);
		rects.forEach(drawRect);*/
		
		/*ctx.save();
		ctx.translate(this.rect.center.x, this.rect.center.y);
		ctx.rotate(this.rect.angle);
		ctx.fillRect(-this.rect.width / 2, -this.rect.height / 2, this.rect.width, this.rect.height);
		ctx.restore();*/
		
		for (let i = 0, n = this.rects.length; i < n; ++i)
		{
			card = this.rects[i];
			ctx.save();
			ctx.fillStyle = "#00000033";
			ctx.translate(card.x + card.halfWidth, card.y + card.halfHeight);
			ctx.rotate(card.angle);
			
			//if (card.type === CardTypeEnum.rectangle)
			{
				ctx.strokeStyle = "rgb(0, 0, 0)";
				ctx.fillRect(-card.halfWidth, -card.halfHeight, card.width, card.height);
				ctx.stroke();
			}
			
			ctx.restore();
			
			for (const touchPos of card.touchPositions)
			{
				ctx.fillStyle = "#333333";
				ctx.beginPath();
				ctx.arc(this.diffBoardX + touchPos.pos.x, this.diffBoardY + touchPos.pos.y, 10, 0, 2 * Math.PI);
				ctx.fill();
			}
		}
	}
	
	private getMousePos(ev: MouseEvent | TouchEvent, identifier: number): Point2DInterface
	{
		const rect = this.touchElement.getBoundingClientRect();
		let clientX = 0;
		let clientY = 0;
		
		if (ev instanceof MouseEvent)
		{
			clientX = ev.clientX;
			clientY = ev.clientY;
		}
		else if (ev instanceof TouchEvent)
		{
			const changedTouchesArray = Array.from(ev.changedTouches);
			for (const touch of changedTouchesArray)
			{
				if (touch.identifier === identifier)
				{
					clientX = touch.clientX;
					clientY = touch.clientY;
				}
			}
		}
		
		return {
			x: -this.diffBoardX + (clientX - rect.x) * this.boardWidth / rect.width,
			y: -this.diffBoardY + (clientY - rect.y) * this.boardHeight / rect.height
		};
	}
	
	private getTouchPos(touch: Touch): Point2DInterface
	{
		const rect = this.touchElement.getBoundingClientRect();
		return {
			x: touch.clientX - rect.left,
			y: touch.clientY - rect.top
		};
	}
	
	private getTouchPosModel(identifier: number): TouchPosModel | null
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
	}
	
	private onMouseWheel(event: WheelEvent): void
	{
		event.stopImmediatePropagation();
		
		const pos = this.getMousePos(event, 0);
		
		let highestCollisionRect: RectModel | null = null;
		
		for (const rect of this.rects)
		{
			const checkCollision = this.gameService.checkPointInRectCollision(pos, rect);
			
			if (checkCollision)
			{
				if (!highestCollisionRect || rect.zIndex > highestCollisionRect.zIndex)
				{
					highestCollisionRect = rect;
				}
			}
		}
		
		if (!highestCollisionRect || highestCollisionRect.isAtValidTarget)
		{
			return;
		}
		highestCollisionRect.targetAngle += event.deltaY * 0.001; // was angle before
		highestCollisionRect.hasMoved = true;
		
		/*if (highestCollisionRect.angle >= Math.PI * 2)
		{
			highestCollisionRect.angle = 0;
		}
		if (highestCollisionRect.angle <= -Math.PI * 2)
		{
			highestCollisionRect.angle = 0;
		}*/
		highestCollisionRect.angleDegrees = MathAngleUtil.radiansToDegrees(highestCollisionRect.angle);
	}
	
	private onMouseDown(event: MouseEvent): void
	{
		event.stopImmediatePropagation();
		
		const mousePos = this.getMousePos(event, 0);
		let touchPosObj = this.getTouchPosModel(0);
		
		if (touchPosObj)
		{
			touchPosObj.pos = mousePos;
		}
		else
		{
			touchPosObj = new TouchPosModel(0, mousePos);
		}
		
		this.setSelectedRect(touchPosObj);
	}
	
	private onMouseMove(event: MouseEvent): void
	{
		event.stopImmediatePropagation();
		
		const touchPosObj = this.getTouchPosModel(0);
		if (touchPosObj)
		{
			touchPosObj.pos = this.getMousePos(event, 0);
		}
	}
	
	private onMouseUp(event: MouseEvent): void
	{
		event.stopImmediatePropagation();
		
		for (const rect of this.rects)
		{
			rect.removeTouchPosition(0);
		}
	}
	
	private onTouchStart(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		
		if (event.touches.length <= 0)
		{
			return;
		}
		
		const changedTouchesArray = Array.from(event.changedTouches);
		for (const touch of changedTouchesArray)
		{
			const mousePos = this.getMousePos(event, touch.identifier);
			let touchPosObj = this.getTouchPosModel(touch.identifier);
			
			if (touchPosObj)
			{
				touchPosObj.pos = mousePos;
			}
			else
			{
				touchPosObj = new TouchPosModel(touch.identifier, mousePos);
			}
			
			this.setSelectedRect(touchPosObj);
		}
	}
	
	private onTouchMove(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		
		const changedTouchesArray = Array.from(event.changedTouches);
		for (const touch of changedTouchesArray)
		{
			for (const rect of this.rects)
			{
				for (const touchPos of rect.touchPositions)
				{
					if (touchPos.identifier === touch.identifier)
					{
						touchPos.pos = this.getTouchPos(touch);
					}
				}
				
				if (rect.touchPositions.length > 1)
				{
					this.handleTouchMoveRotate(rect);
				}
			}
		}
	}
	
	private onTouchEnd(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		
		this.removeTouch(event);
	}
	
	private onTouchCancel(event: TouchEvent): void
	{
		event.stopImmediatePropagation();
		
		this.removeTouch(event);
	}
	
	private removeTouch(event: TouchEvent): void
	{
		const deleteTouchPositions: Array<{ rect: RectModel, identifier: number }> = [];
		const changedTouchesArray = Array.from(event.changedTouches);
		for (const touch of changedTouchesArray)
		{
			for (const rect of this.rects)
			{
				for (const touchPosition of rect.touchPositions)
				{
					if (touchPosition.identifier === touch.identifier)
					{
						deleteTouchPositions.push({rect: rect, identifier: touch.identifier})
					}
				}
			}
		}
		
		for (const deleteTouchPosition of deleteTouchPositions)
		{
			deleteTouchPosition.rect.removeTouchPosition(deleteTouchPosition.identifier);
		}
	}
	
	private setSelectedRect(touchPosObj: TouchPosModel): void
	{
		let highestCollisionRect: RectModel | null = null;
		
		for (const rect of this.rects)
		{
			if (
				rect.blockedTimer <= 0 && // if rect is not blocked by timer (at wrong target before)
				rect.touchPositions.length >= 0 && rect.touchPositions.length <= 1)// check pos 1 & 2 collision
			{
				const isCollision = this.gameService.checkPointInRectCollision(touchPosObj.pos, rect);
				if (isCollision)
				{
					if (!highestCollisionRect || rect.zIndex > highestCollisionRect.zIndex)
					{
						highestCollisionRect = rect;
					}
				}
			}
		}
		
		if (
			highestCollisionRect &&
			!highestCollisionRect.isAtValidTarget  // cards that are placed correctly freeze in place
		)
		{
			if (highestCollisionRect.touchPositions.length === 0)// check pos 1 collision
			{
				// set z-index
				const oldZIndex = highestCollisionRect.zIndex;
				highestCollisionRect.zIndex = this.rects.length + ShapeSlingshotGameConfig.DIV_MIN_Z_INDEX;
				
				for (const rect of this.rects)
				{
					if (oldZIndex <= rect.zIndex)
					{
						rect.zIndex--;
					}
				}
			}
			else if (highestCollisionRect.touchPositions.length === 1) // check pos 2 collision
			{
				highestCollisionRect.initialAngle = this.gameService.getRotationRadianAngle(
					highestCollisionRect.touchPositions[0].pos, touchPosObj.pos
				);
			}
			
			// reset current target
			highestCollisionRect.targetId = null;
			highestCollisionRect.isAtTargetPosition = false;
			highestCollisionRect.isAtTargetAngle = false;
			highestCollisionRect.isAtValidTarget = false;
			highestCollisionRect.targetState = CardTargetStateEnum.notAtTarget;
			
			// set rect is touched
			highestCollisionRect.updateTouchPosition(touchPosObj);
		}
	}
	
	private handleTouchMoveRotate(rect: RectModel): void
	{
		if (rect.touchPositions.length < 2)
		{
			return;
		}
		
		const currentAngle: number = this.gameService.getRotationRadianAngle(rect.touchPositions[0].pos, rect.touchPositions[1].pos);
		const deltaAngle: number = currentAngle - rect.initialAngle;
		rect.angle += deltaAngle; // was angle before
		rect.targetAngle = rect.angle;
		rect.initialAngle = currentAngle;
		rect.hasMoved = true;
		rect.angleDegrees = MathAngleUtil.radiansToDegrees(rect.angle);
	}
	
	private handleTouchMoveSlide(rect: RectModel): void
	{
		if (rect.wasTouchPos1Removed)
		{
			rect.wasTouchPos1Removed = false;
		}
		
		if (rect.touchPositions.length <= 0)
		{
			return;
		}
		
		const touchPos1 = rect.getTouchPosModel(rect.touchPositions[0].identifier);
		
		if (!touchPos1)
		{
			return;
		}
		
		let point2: Point2DInterface;
		
		if (rect.touchPositions.length > 1)
		{
			const touchPos2 = rect.getTouchPosModel(rect.touchPositions[1].identifier);
			
			if (!touchPos2)
			{
				return;
			}
			
			point2 = {
				x: rect.x + rect.halfWidth - (touchPos2.pos.x - touchPos1.pos.x) * 0.5,
				y: rect.y + rect.halfHeight - (touchPos2.pos.y - touchPos1.pos.y) * 0.5
			};
		}
		else
		{
			if (rect.wasTouchPos2Removed)
			{
				rect.wasTouchPos2Removed = false;
				rect.x = touchPos1.pos.x - rect.halfWidth;
				rect.y = touchPos1.pos.y - rect.halfHeight;
			}
			
			point2 = {
				x: rect.x + rect.halfWidth,
				y: rect.y + rect.halfHeight
			};
		}
		
		const distance = this.gameService.getDistance(touchPos1.pos, point2);
		const angle = this.gameService.getRotationRadianAngle(point2, touchPos1.pos);
		
		rect.velocityX = Math.cos(angle) * distance * 0.5;
		rect.velocityY = Math.sin(angle) * distance * 0.5;
	}
	
	private update(delta: number)
	{
		const deltaFactor: number = delta * 0.06;
		
		for (const targetRect of this.targetRects)
		{
			targetRect.update();
		}
		
		let areRectsAtValidTargets: boolean = true;
		for (const rect of this.rects)
		{
			this.handleTouchMoveSlide(rect);
			this.checkCollisionWithTargetRects(rect);
			rect.update(delta, deltaFactor, this.boardWidth, this.boardHeight);
			
			if (!rect.isAtValidTarget)
			{
				areRectsAtValidTargets = false;
			}
		}
		
		if (areRectsAtValidTargets)
		{
			this.callFinishGame();
		}
		
		this.changeDetectorRef.detectChanges();
	}
	
	private callFinishGame(): void
	{
		this.appLoopService.stop();
		this.removeEventListeners();
		
		const runtime: number = Math.floor(this.appLoopService.signalRuntime() / 1000);
		//console.log('finish game - runtime: ', runtime);
		this.finishGame.emit({isSuccess: true, runtime: runtime});
		/*const restart = (): void => {
			this.board.nativeElement.removeChild(div);
			this.emptyBoard();
			this.addEventListener();
			this.startGame();
		};*/
	}
	
	private checkCollisionWithTargetRects(rect: RectModel): void
	{
		if (
			rect.targetId || // this for not choosing always another target when velocity is too high
			(rect.isAtTargetPosition && rect.isAtTargetAngle)
		)
		{
			return;
		}
		
		const point2: Point2DInterface = {x: rect.x + rect.halfWidth, y: rect.y + rect.halfHeight};
		
		let minDistanceTargetRect: {
			targetRect: TargetRectModel,
			distance: number,
			point1: Point2DInterface
		} | null = null;
		
		for (const targetRect of this.targetRects)
		{
			const point1: Point2DInterface = {
				x: targetRect.x + targetRect.halfWidth,
				y: targetRect.y + targetRect.halfHeight
			};
			const distance: number = this.gameService.getDistance(point1, point2);
			const minDistance: number = Math.max(targetRect.halfWidth, targetRect.halfHeight);
			
			if (rect.touchPositions.length <= 0 && distance <= minDistance)
			{
				if (!minDistanceTargetRect || minDistanceTargetRect.distance > distance)
				{
					minDistanceTargetRect = {targetRect: targetRect, distance: distance, point1};
				}
			}
		}
		
		if (minDistanceTargetRect)
		{
			if (!rect.targetId) // this for not choosing always another target when velocity is too high
			{
				rect.targetId = minDistanceTargetRect.targetRect.id;
				
				const findTargetPosById = rect.getSpecialTargetPosById(minDistanceTargetRect.targetRect.id);
				
				if (findTargetPosById)
				{
					rect.targetPos = {
						x: findTargetPosById.x + rect.halfWidth,
						y: findTargetPosById.y + rect.halfHeight
					};
					rect.targetAngle = findTargetPosById.angle;
				}
				else
				{
					rect.targetPos = minDistanceTargetRect.point1;
					rect.targetAngle = minDistanceTargetRect.targetRect.angle;
				}
			}
		}
		else
		{
			rect.targetId = null;
			rect.targetPos = null;
		}
	}
	
	private loop(delta: number): void
	{
		this.update(delta);
		this.draw();
	}
}
