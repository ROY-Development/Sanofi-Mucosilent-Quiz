export class TargetModel
{
	public waitTime: number = 0;
	public hasDirectionChanged: boolean = false;
	public isHit: boolean = false;
	
	constructor(
		public index: number,
		public x: number,
		public y: number,
		public width: number,
		public height: number,
		public angle: number,
		public minX: number,
		public minY: number,
		public maxX: number,
		public maxY: number,
		public points: number
	)
	{
	}
	
	public update(delta: number): void
	{
		if (this.waitTime > 0)
		{
			this.waitTime -= delta;
			return;
		}
		else
		{
			delta -= this.waitTime;
			this.waitTime = 0;
		}
		
		let speed: number = 0.1;
		if (this.angle === Math.PI * 0.5 || this.angle === -Math.PI * 0.5)
		{
			speed /= 1.565454545454545454; // = (width + margin) / (height + margin)
		}
		
		this.x += Math.cos(this.angle) * speed * delta; // Position leicht innen
		this.y += Math.sin(this.angle) * speed * delta;
		
		if (this.angle === 0 && this.x >= this.maxX)
		{
			this.angle = Math.PI * 0.5; // down
			//this.waitTime = 1050;
			//	this.waitTime = 6100;
			this.hasDirectionChanged = true;
		}
		else if (this.angle === Math.PI * 0.5 && this.y >= this.maxY)
		{
			this.angle = Math.PI; // left
			this.hasDirectionChanged = true;
		}
		else if (this.angle === Math.PI && this.x <= this.minX)
		{
			this.angle = -Math.PI * 0.5; // up
			//	this.waitTime = 6100;
			this.hasDirectionChanged = true;
		}
		else if (this.angle === -Math.PI * 0.5 && this.y < this.minY)
		{
			this.angle = 0; // right
			this.hasDirectionChanged = true;
		}
	}
}