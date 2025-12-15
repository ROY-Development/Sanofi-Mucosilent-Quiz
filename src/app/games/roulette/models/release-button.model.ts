import {RouletteGameConfig} from '../roulette-game.config';

export class ReleaseButtonModel
{
	public isPressed: boolean = false;
	public pressFactor: number = 0;
	
	private currentPressTime: number = 0;
	
	constructor(
		public x: number,
		public y: number,
		public width: number,
		public height: number
	)
	{
	
	}
	
	public update(delta: number): void
	{
		if (this.isPressed)
		{
			this.currentPressTime += delta;
			this.currentPressTime = Math.min(RouletteGameConfig.maxPressTime, this.currentPressTime);
			this.pressFactor = this.currentPressTime / RouletteGameConfig.maxPressTime;
		}
		else if (this.currentPressTime > 0)
		{
			this.currentPressTime = 0;
			this.pressFactor = 0;
		}
	}
}