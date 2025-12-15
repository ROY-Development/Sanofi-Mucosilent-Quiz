export class BreakPadModel
{
	public isBallCollision: boolean = false;
	
	constructor(
		public x: number,
		public y: number,
		public width: number,
		public height: number,
		public minX: number,
		public maxX: number,
		public speed: number,
		public breakValue: number,
		public isMovingLeft: boolean
	)
	{
	
	}
	
	public update(delta: number): void
	{
		if (this.isMovingLeft)
		{
			this.x -= this.speed * delta;
		}
		else
		{
			this.x += this.speed * delta;
		}
		
		if (this.x > this.maxX)
		{
			this.isMovingLeft = true;
		}
		else if (this.x < this.minX)
		{
			this.isMovingLeft = false;
		}
	}
}