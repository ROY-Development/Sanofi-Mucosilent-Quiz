export class ColumnModel
{
	public isTestingCollision: boolean = false;
	
	constructor(
		public x: number,
		public y: number,
		public width: number,
		public height: number,
		public points: number,
		public isColLeft: boolean,
		public isColRight: boolean,
		public collisionTime: number,
		public finishTime: number
	)
	{
	}
	
	public update(delta: number): void
	{
		if (this.collisionTime > 0)
		{
			this.collisionTime -= delta;
			this.collisionTime = Math.max(0, this.collisionTime);
		}
		if (this.finishTime > 0)
		{
			this.finishTime -= delta;
			this.finishTime = Math.max(0, this.finishTime);
		}
	}
}