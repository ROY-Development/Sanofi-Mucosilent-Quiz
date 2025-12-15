import {Point2DInterface} from '../../interfaces/point-2D.interface';
import {GameService} from '../../shape-slingshot/services/game.service';
import {QuestionConfigModel} from './question-config.model';

export class QuestionCardModel
{
	public startPos: Point2DInterface;
	public halfWidth: number;
	public halfHeight: number;
	public targetPos: Point2DInterface | null = null;
	public velocityX: number = 0;
	public velocityY: number = 0;
	public swipeAngleX: number = 0;
	public hasMoved: boolean = false;
	public isAtTargetPosition: boolean = false;
	public style: any = {};
	
	// behavior
	public text: string | undefined = undefined;
	public textKey: string | undefined = undefined;
	public textFeedbackKey: string | undefined = undefined;
	public scale: number = 0;
	
	constructor(
		public gameService: GameService,
		public x: number,
		public y: number,
		public width: number,
		public height: number,
		public questionConfig: QuestionConfigModel
	)
	{
		this.startPos = {x: x, y: y};
		this.halfWidth = width * 0.5;
		this.halfHeight = height * 0.5;
	}
	
	public update(delta: number): void
	{
		if (delta > 0)
		{
			//
		}
		this.style['left'] = this.x + 'px';
		this.style['top'] = this.y + 'px';
		this.style['width'] = this.width + 'px';
		this.style['height'] = this.height + 'px';
		
		this.updatePosition();
	}
	
	private updatePosition(): void
	{
		if (this.velocityX || this.velocityY || this.hasMoved)
		{
			this.x += this.velocityX;
			this.y += this.velocityY;
			this.hasMoved = false;
			
			//this.checkCollisionWithBoardBorders(boardWidth, boardHeight);
			
			/*const velocityFactor = Math.min(0.93, 0.95 * deltaFactor);
			this.velocityX *= velocityFactor;
			this.velocityY *= velocityFactor;*/
			
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
			//this.isAtTargetAngle = false;
			return;
		}
		
		const point2: Point2DInterface = {x: this.x + this.halfWidth, y: this.y + this.halfHeight};
		
		// velocity to target position
		const distance: number = this.gameService.getDistance(this.targetPos, point2);
		const angle: number = this.gameService.getRotationRadianAngle(point2, this.targetPos);
		this.velocityX = Math.cos(angle) * distance * 0.1;
		this.velocityY = Math.sin(angle) * distance * 0.1;
		
		this.isAtTargetPosition = distance < 10;
	}
}