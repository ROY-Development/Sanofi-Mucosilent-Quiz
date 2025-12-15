import {TouchPosModel} from './touch-pos.model';
import {GameService} from '../services/game.service';
import {Point2DInterface} from '../../interfaces/point-2D.interface';
import {MathAngleUtil} from '../../../shared/utils/math-angle.util';
import {CardTargetStateEnum} from '../enums/card-target-state.enum';

export class RectModel
{
	public startPos: Point2DInterface;
	public startAngle: number;
	public halfWidth: number;
	public halfHeight: number;
	public angle: number;
	public angleDegrees: number = 0;
	public targetAngle: number = 0; // will be used always
	public targetPos: Point2DInterface | null = null;
	public targetId: string | 'backToStart' | null = null;
	public specialTargets: Array<{ id: string, x: number, y: number, angle: number }> = [];
	public zIndex: number = 0;
	public velocityX: number = 0;
	public velocityY: number = 0;
	public hasMoved: boolean = false;
	public touchPositions: Array<TouchPosModel> = [];
	public wasTouchPos1Removed: boolean = false;
	public wasTouchPos2Removed: boolean = false;
	public isAtTargetPosition: boolean = false;
	public isAtTargetAngle: boolean = false;
	public isAtValidTarget: boolean = false;
	public targetState: CardTargetStateEnum = CardTargetStateEnum.notAtTarget;
	public blockedTimer: number = 0; // ms
	public style: any = {};
	
	// behavior
	public text: string | undefined = undefined;
	public textKey: string | undefined = undefined;
	
	constructor(
		public gameService: GameService,
		public id: string,
		public targetIds: Array<string>,
		public x: number,
		public y: number,
		public width: number,
		public height: number,
		public initialAngle: number,
		private callbackAtTarget: (targetState: CardTargetStateEnum) => void
	)
	{
		this.startPos = {x: x, y: y};
		this.startAngle = initialAngle;
		this.halfWidth = width * 0.5;
		this.halfHeight = height * 0.5;
		this.angle = initialAngle;
		this.targetAngle = initialAngle;
	}
	
	public getSpecialTargetPosById(targetId: string): { x: number, y: number, angle: number } | null
	{
		for (const value of this.specialTargets)
		{
			if (value.id === targetId)
			{
				return value;
			}
		}
		
		return null;
	}
	
	public getTouchPosModel(identifier: number): TouchPosModel | null
	{
		for (const value of this.touchPositions)
		{
			if (value.identifier === identifier)
			{
				return value;
			}
		}
		
		return null;
	}
	
	public updateTouchPosition(targetTouchPos: TouchPosModel): void
	{
		const touchPos = this.getTouchPosModel(targetTouchPos.identifier);
		if (touchPos)
		{
			touchPos.pos = targetTouchPos.pos;
		}
		else
		{
			this.touchPositions.push(targetTouchPos);
		}
	}
	
	public removeTouchPosition(identifier: number): void
	{
		const touchPos = this.getTouchPosModel(identifier);
		
		if (!touchPos)
		{
			return;
		}
		
		//this.touchPositions.splice(this.touchPositions.indexOf(touchPos), 1);
		
		if (this.touchPositions.length === 2)
		{
			this.wasTouchPos2Removed = true;
			this.wasTouchPos1Removed = true;
			this.hasMoved = true;
		}
		else if (this.touchPositions.length === 1)
		{
			this.wasTouchPos1Removed = true;
			this.hasMoved = true;
		}
		
		this.touchPositions = [];
	}
	
	public update(delta: number, deltaFactor: number, boardWidth: number, boardHeight: number): void
	{
		if (this.blockedTimer <= 0)
		{
			this.updatePosition(deltaFactor, boardWidth, boardHeight);
			this.updateAngle(deltaFactor);
		}
		this.updateIfItAsTarget();
		this.updateIsBlocked(delta);
		
		this.style['left'] = this.x + 'px';
		this.style['top'] = this.y + 'px';
		this.style['width'] = this.width + 'px';
		this.style['height'] = this.height + 'px';
		this.style['zIndex'] = this.zIndex;
		
		// shake
		if (this.blockedTimer > 0)
		{
			this.style['transform'] = `
			translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)
			rotate(${this.angleDegrees + Math.sin(this.blockedTimer) * 2}deg)`;
		}
		else
		{
			this.style['transform'] = 'rotate(' + this.angleDegrees + 'deg)';
		}
	}
	
	private updateIsBlocked(delta: number): void
	{
		if (this.blockedTimer <= 0)
		{
			return;
		}
		
		this.blockedTimer -= delta;
		if (this.blockedTimer <= 0)
		{
			this.blockedTimer = 0;
			this.setBackToStart();
		}
	}
	
	private setBackToStart(): void
	{
		this.targetId = 'backToStart';
		this.targetPos = {x: this.startPos.x + this.halfWidth, y: this.startPos.y + this.halfHeight};
		this.targetAngle = this.startAngle;
		this.isAtTargetPosition = false;
		this.isAtTargetAngle = false;
		this.targetState = CardTargetStateEnum.notAtTarget;
	}
	
	private updateIfItAsTarget(): void
	{
		if (
			this.targetState === CardTargetStateEnum.notAtTarget &&
			this.isAtTargetPosition &&
			this.isAtTargetAngle
		)
		{
			if (this.targetId === 'backToStart')
			{
				//console.log('back to start');
				this.isAtTargetPosition = false;
				this.isAtTargetAngle = false;
				this.targetState = CardTargetStateEnum.notAtTarget;
				this.targetId = null;
				this.velocityX = 0;
				this.velocityY = 0;
			}
			else if (this.targetId && this.targetIds.indexOf(this.targetId) !== -1)
			{
				//console.log('valid')
				this.isAtValidTarget = true;
				this.targetState = CardTargetStateEnum.validTarget;
				
				// login in target pos
				if (this.targetPos)
				{
					this.x = this.targetPos.x - this.halfWidth;
					this.y = this.targetPos.y - this.halfHeight;
				}
			}
			else
			{
				//console.log('invalid')
				this.targetState = CardTargetStateEnum.invalidTarget;
				this.blockedTimer = 1000;
			}
			this.callbackAtTarget(this.targetState);
		}
	}
	
	private updatePosition(deltaFactor: number, boardWidth: number, boardHeight: number): void
	{
		if (this.velocityX || this.velocityY || this.hasMoved)
		{
			this.x += this.velocityX;
			this.y += this.velocityY;
			this.hasMoved = false;
			
			this.checkCollisionWithBoardBorders(boardWidth, boardHeight);
			
			const velocityFactor = Math.min(0.93, 0.95 * deltaFactor);
			this.velocityX *= velocityFactor;
			this.velocityY *= velocityFactor;
			
			if (Math.abs(this.velocityX) < 0.1)
			{
				this.velocityX = 0;
			}
			if (Math.abs(this.velocityY) < 0.1)
			{
				this.velocityY = 0;
			}
		}
		
		if (!this.targetPos)
		{
			this.isAtTargetPosition = false;
			this.isAtTargetAngle = false;
			return;
		}
		
		const point2: Point2DInterface = {x: this.x + this.halfWidth, y: this.y + this.halfHeight};
		
		// velocity to target position
		const distance: number = this.gameService.getDistance(this.targetPos, point2);
		const angle: number = this.gameService.getRotationRadianAngle(point2, this.targetPos);
		this.velocityX = Math.cos(angle) * distance * 0.5;
		this.velocityY = Math.sin(angle) * distance * 0.5;
		
		this.isAtTargetPosition = distance < 10;
	}
	
	private checkCollisionWithBoardBorders(boardWidth: number, boardHeight: number): boolean
	{
		let isCollision: boolean = false;
		const rectMinMaxCorners = this.gameService.getRectMinMaxCorners(this);
		
		if (rectMinMaxCorners.minCornerX < 0)
		{
			if (this.touchPositions.length > 0 && this.touchPositions[0].pos.x < rectMinMaxCorners.maxCornerX * 0.5)
			{
				//this.touchPositions[0].pos.x = rectMinMaxCorners.maxCornerX * 0.5;
				this.velocityX = 0;
			}
			else
			{
				this.velocityX *= -1 * 0.5;
			}
			
			this.x -= rectMinMaxCorners.minCornerX;
			isCollision = true;
		}
		else if (rectMinMaxCorners.maxCornerX > boardWidth)
		{
			if (this.touchPositions.length > 0 && this.touchPositions[0].pos.x + boardWidth > rectMinMaxCorners.maxCornerX * 0.5)
			{
				this.velocityX = 0;
			}
			else
			{
				this.velocityX *= -1 * 0.5;
			}
			
			this.x -= rectMinMaxCorners.maxCornerX - boardWidth;
			isCollision = true;
		}
		
		if (rectMinMaxCorners.minCornerY < 0)
		{
			if (this.touchPositions.length > 0 && this.touchPositions[0].pos.y < rectMinMaxCorners.maxCornerY * 0.5)
			{
				//this.touchPositions[0].pos.y = rectMinMaxCorners.maxCornerY * 0.5;
				this.velocityY = 0;
			}
			else
			{
				this.velocityY *= -1 * 0.5;
			}
			
			this.y -= rectMinMaxCorners.minCornerY;
			isCollision = true;
		}
		else if (rectMinMaxCorners.maxCornerY > boardHeight)
		{
			if (this.touchPositions.length > 0 && this.touchPositions[0].pos.y + boardHeight > rectMinMaxCorners.maxCornerY * 0.5)
			{
				this.velocityY = 0;
			}
			else
			{
				this.velocityY *= -1 * 0.5;
			}
			
			this.y -= rectMinMaxCorners.maxCornerY - boardHeight;
			isCollision = true;
		}
		
		return isCollision;
	}
	
	private updateAngle(deltaFactor: number): void
	{
		let deltaAngle = this.targetAngle - this.angle;
		
		if (deltaAngle > Math.PI)
		{
			deltaAngle -= 2 * Math.PI;
		}
		else if (deltaAngle < -Math.PI)
		{
			deltaAngle += 2 * Math.PI;
		}
		
		const distance: number = Math.abs(deltaAngle);
		const maxSpeed: number = 1;
		const acceleration: number = 0.1;
		const speed: number = Math.min(maxSpeed, distance * acceleration);
		const step: number = speed * deltaFactor;
		
		if (deltaAngle > step + 0.005 * deltaFactor)
		{
			this.isAtTargetAngle = false;
			this.angle += step;
		}
		else if (deltaAngle < -step - 0.005 * deltaFactor)
		{
			this.isAtTargetAngle = false;
			this.angle -= step;
		}
		else
		{
			this.isAtTargetAngle = true;
			this.angle = this.targetAngle;
		}
		
		this.angleDegrees = MathAngleUtil.radiansToDegrees(this.angle);
	}
}