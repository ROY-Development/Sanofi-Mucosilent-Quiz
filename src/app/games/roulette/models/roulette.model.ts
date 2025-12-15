import {MathAngleUtil} from '../../../shared/utils/math-angle.util';

export class RouletteModel
{
	// public isTestingCollision: boolean = false;
	
	constructor(
		public x: number,
		public y: number,
		public radius: number,
		public angle: number
		//public points: number,
		//public collisionTime: number,
		//public finishTime: number
	)
	{
	}
	
	public update(delta: number): void
	{
		this.angle += 0.0005 * delta;
		this.angle = MathAngleUtil.normalizeAngle(this.angle);
		
		/*	if (this.collisionTime > 0)
			{
				this.collisionTime -= delta;
				this.collisionTime = Math.max(0, this.collisionTime);
			}
			if (this.finishTime > 0)
			{
				this.finishTime -= delta;
				this.finishTime = Math.max(0, this.finishTime);
			}*/
	}
}