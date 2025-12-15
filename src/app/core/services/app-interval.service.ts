export class AppIntervalService
{
	public intervalStartTime: number = 0;
	public intervalTime: number = 0;
	public intervalRepeatIndex: number = 0;
	public intervalFunctionCallCount: number = 0;
	
	private _isRunning: boolean = false;
	private intervalFunction: (() => void) | null = null;
	private intervalFinishFunction: (() => void) | null = null;
	
	public get isRunning(): boolean
	{
		return this._isRunning;
	}
	
	constructor()
	{
	}
	
	public startIntervalFunction(
		intervalStartTime: number,
		intervalFunctionCallCount: number,
		intervalFunction: () => void,
		intervalFinishFunction: () => void
	): void
	{
		this._isRunning = true;
		this.intervalStartTime = intervalStartTime;
		this.intervalTime = this.intervalStartTime;
		this.intervalFunctionCallCount = intervalFunctionCallCount;
		this.intervalRepeatIndex = 0;
		this.intervalFunction = intervalFunction;
		this.intervalFinishFunction = intervalFinishFunction;
	}
	
	public update(delta: number): void
	{
		if (!this.intervalFunction || !this.intervalFinishFunction)
		{
			return;
		}
		
		if (this.intervalTime > 0)
		{
			this.intervalTime -= delta;
			
			if (this.intervalTime <= 0)
			{
				if (this.intervalFunctionCallCount <= 0)
				{
					const intervalFinishFunction = this.intervalFinishFunction;
					this.reset();
					intervalFinishFunction();
				}
				else
				{
					this.intervalTime = this.intervalStartTime;
					
					this.intervalFunction();
					this.intervalRepeatIndex++;
				}
				
				this.intervalFunctionCallCount--;
			}
		}
	}
	
	public reset(): void
	{
		this.intervalStartTime = 0;
		this.intervalTime = 0;
		this.intervalRepeatIndex = 0;
		this.intervalFunctionCallCount = 0;
		
		this._isRunning = false;
		this.intervalFunction = null;
		this.intervalFinishFunction = null;
	}
}