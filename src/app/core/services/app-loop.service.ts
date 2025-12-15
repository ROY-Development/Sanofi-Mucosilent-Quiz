import {NgZone, signal} from '@angular/core';

/*
	Use this as own instance each time in a component
	
	private readonly appLoopService: AppLoopService = new AppLoopService(this.loop.bind(this));

	constructor()
	{
		this.appLoopService.stop();
		this.appLoopService.setRuntime(0);
		this.appLoopService.init('Name');
	}
	
	private loop(delta: number): void {}
 */

export class AppLoopService
{
	public signalRuntime = signal<number>(0);
	private runTime: number = 0;
	private lastTime: number = Date.now();
	//private currentTime: number = 0;
	private delta: number = 0;
	private animationFrameId: number = -1;
	private name: string = '';
	
	public ngZone: NgZone | null = null;
	
	constructor(
		private loopCallback: (delta: number) => void
	)
	{
	}
	
	public init(name: string, ngZone: NgZone | null = null): void
	{
		this.name = name;
		this.ngZone = ngZone;
	}
	
	public get isRunning(): boolean
	{
		return this.animationFrameId > -1;
	}
	
	public setRuntime(runtime: number): void
	{
		this.runTime = runtime;
		this.signalRuntime.set(this.runTime);
	}
	
	public start(runTime: number = 0): void
	{
		this.stop();
		this.lastTime = 0;
		this.setRuntime(runTime);
		
		if (this.ngZone)
		{
			this.loopNGZone(0);
		}
		else
		{
			this.loop(0);
		}
	}
	
	public stop(): void
	{
		if (this.animationFrameId > -1)
		{
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = -1;
		}
	}
	
	private loop(runTime: number): void
	{
		this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
		
		// console.log('loop', this.name)
		this.delta = runTime - this.lastTime;
		this.runTime += this.delta;
		//this.signalRuntime.set(this.runTime);
		
		this.loopCallback(this.delta);
		this.lastTime = runTime;
	}
	
	private loopNGZone(runTime: number): void
	{
		this.ngZone!.runOutsideAngular(() => {
			this.animationFrameId = requestAnimationFrame(this.loopNGZone.bind(this));
			
			// console.log('loop', this.name)
			this.delta = runTime - this.lastTime;
			this.runTime += this.delta;
			//this.signalRuntime.set(this.runTime);
			
			this.loopCallback(this.delta);
			this.lastTime = runTime;
		});
	}
}