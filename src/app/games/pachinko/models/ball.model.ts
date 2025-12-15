import {PachinkoGameConfig} from '../pachinko-game.config';

export class BallModel
{
	public oldX: number;
	public oldY: number;
	
	public isColLeft: boolean = false;
	public isColRight: boolean = false;
	public isReleased: boolean = false;
	
	public diffX: number = 0;
	
	constructor(
		public x: number,
		public y: number,
		public dx: number,
		public dy: number,
		public radius: number,
		public angle: number
	)
	{
		this.oldX = x;
		this.oldY = y;
	}
	
	public update(delta: number): void
	{
		this.oldX = this.x;
		this.oldY = this.y;
		
		if (this.dx > 0)
		{
			this.dx -= 0.02 * PachinkoGameConfig.sizeFactor;
			this.dx = Math.max(0, this.dx);
		}
		else if (this.dx < 0)
		{
			this.dx += 0.02 * PachinkoGameConfig.sizeFactor;
			this.dx = Math.min(0, this.dx);
		}
		
		this.dy += 0.1 * PachinkoGameConfig.sizeFactor;
		
		if (this.dy < 0)
		{
			this.dy += 0.1 * PachinkoGameConfig.sizeFactor;
			this.dy = Math.min(0, this.dy);
		}
		
		this.x += this.dx * delta * 0.1 * PachinkoGameConfig.sizeFactor;
		this.y += this.dy * delta * 0.1 * PachinkoGameConfig.sizeFactor;
		this.angle += (this.dx * this.dy) * delta * 0.01 * PachinkoGameConfig.sizeFactor;
	}
}