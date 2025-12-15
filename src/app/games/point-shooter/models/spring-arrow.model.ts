export class SpringArrowModel
{
	public static readonly maxSpanFactor: number = 1.9;
	
	public isWiggling: boolean = false;
	
	public angle: number = 0;
	
	public startY: number = 0;
	private maxY: number = 0;
	private wiggleFactor: number = 0;
	
	constructor(
		public x: number,
		public y: number,
		public width: number,
		public height: number
	)
	{
		this.startY = y;
		this.maxY = this.startY + this.height - this.getSpanFactor(1) * this.height;
	}
	
	public update(delta: number, pressFactor: number, targetX: number): void
	{
		this.x = targetX - this.width * 0.5;
		this.y = this.startY + this.height - this.getSpanFactor(pressFactor) * this.height;
		this.y = Math.min(this.maxY, this.y);
		this.y = Math.max(this.startY, this.y);
		
		this.isWiggling = pressFactor > 0 && pressFactor < 0.2 || pressFactor >= 1;
		
		if (this.isWiggling)
		{
			this.wiggleFactor += delta * 0.06;
			this.angle = Math.cos(this.wiggleFactor) * Math.PI * 0.02;
		}
		else
		{
			this.wiggleFactor = 0;
			this.angle = 0;
		}
	}
	
	public getSpanFactor(pressFactor: number): number
	{
		return 1 - Math.sqrt(pressFactor) * SpringArrowModel.maxSpanFactor;
	}
}