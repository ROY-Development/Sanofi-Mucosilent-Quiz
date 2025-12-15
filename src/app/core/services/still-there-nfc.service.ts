import {Injectable, signal} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class StillThereNfcService
{
	public readonly signalIsCheckEnabled = signal<boolean>(false);
	public readonly signalTimerSeconds = signal<number>(20);
	
	constructor()
	{
	}
	
	public decrementTimer(): void
	{
		if (!this.signalIsCheckEnabled())
		{
			return;
		}
		
		this.signalTimerSeconds.set(this.signalTimerSeconds() - 1);
	}
	
	public resetTimer(): void
	{
		this.signalTimerSeconds.set(20);//this.initService.appConfig.stillThereSeconds);
	}
}
