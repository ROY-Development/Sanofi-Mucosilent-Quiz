export class BallHolderModel
{
	public oldX: number;
	public oldY: number;
	public isOpen: boolean = false;
	public openTime: number = 0;
	public isDragging: boolean = false;
	public dragPosX: number = 0;
	
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
	}
}