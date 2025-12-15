export class BallModel
{
	public oldX: number;
	public oldY: number;
	
	public speed: number = 0;
	public viewAngle: number = 0;
	public isInsideWheel: boolean = false;
	
	public isColLeft: boolean = false;
	public isColRight: boolean = false;
	public isReleased: boolean = false;
	public isTargetLocked: boolean = false;
	public lockedWheelAngle: number = 0;
	public currentWheelAngle: number = 0;
	public currentWheelSegmentNumber: number = 0;
	
	public diffX: number = 0;
	
	constructor(
		public x: number,
		public y: number,
		public dx: number,
		public dy: number,
		public radius: number,
		public angle: number,
		public fallAngle: number = 0.001
	)
	{
		this.oldX = x;
		this.oldY = y;
	}
	
	public update(delta: number): void
	{
		this.oldX = this.x;
		this.oldY = this.y;
		
		if (!this.isReleased)
		{
			if (this.dx > 0)
			{
				this.dx -= 0.02;
				this.dx = Math.max(0, this.dx);
			}
			else if (this.dx < 0)
			{
				this.dx += 0.02;
				this.dx = Math.min(0, this.dx);
			}
			
			this.dy += 0.1;
			
			if (this.dy < 0)
			{
				this.dy += 0.1;
				this.dy = Math.min(0, this.dy);
			}
			
			this.x += this.dx * delta * 0.1;
			this.y += this.dy * delta * 0.1;
			this.angle += (this.dx * this.dy) * delta * 0.01;
		}
	}
}