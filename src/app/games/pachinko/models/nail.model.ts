import {PachinkoGameConfig} from '../pachinko-game.config';

export class NailModel
{
	constructor(
		public x: number,
		public y: number,
		public radius: number,
		public stutterX: number,
		public stutterY: number
	)
	{
	}
	
	public updateStuttering(delta: number): void
	{
		if (this.stutterX > 0)
		{
			this.stutterX -= 0.01 * delta * PachinkoGameConfig.sizeFactor;
			this.stutterX = Math.max(0, this.stutterX);
		}
		else if (this.stutterX < 0)
		{
			this.stutterX += 0.01 * delta * PachinkoGameConfig.sizeFactor;
			this.stutterX = Math.min(0, this.stutterX);
		}
		
		if (this.stutterY > 0)
		{
			this.stutterY -= 0.01 * delta * PachinkoGameConfig.sizeFactor;
			this.stutterY = Math.max(0, this.stutterY);
		}
		else if (this.stutterY < 0)
		{
			this.stutterY += 0.01 * delta * PachinkoGameConfig.sizeFactor;
			this.stutterY = Math.min(0, this.stutterY);
		}
	}
}