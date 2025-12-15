import {PachinkoGameConfig} from '../pachinko-game.config';

export class BallHolderModel
{
	public oldX: number;
	public oldY: number;
	public isOpen: boolean = false;
	public openTime: number = 0;
	public isDragging: boolean = false;
	public dragPosX: number = 0;
	private isMovingLeft: boolean = false;
	
	constructor(
		public x: number,
		public y: number,
		public width: number,
		public height: number
	)
	{
		this.oldX = x;
		this.oldY = y;
	}
	
	public open(openTime: number = 300): void
	{
		this.isOpen = true;
		this.openTime = openTime;
	}
	
	public update(delta: number): void
	{
		if (this.openTime > 0)
		{
			this.openTime -= delta;
			
			if (this.openTime <= 0)
			{
				this.isOpen = false;
				this.openTime = 0;
			}
		}
		
		if (PachinkoGameConfig.isAutomaticLeftRightMovement)
		{
			if (this.isMovingLeft)
			{
				this.x -= 0.3 * delta;
				if (this.x <= 135)
				{
					this.isMovingLeft = false;
				}
			}
			else
			{
				this.x += 0.3 * delta;
				if (this.x >= 840)
				{
					this.isMovingLeft = true;
				}
			}
		}
	}
}