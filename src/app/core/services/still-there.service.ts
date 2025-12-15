import {inject, Injectable, signal} from '@angular/core';
import {AppRoutesEnum} from '../../app-routes.enum';
import {InitService} from './init.service';

@Injectable({
	providedIn: 'root'
})
export class StillThereService
{
	private initService = inject(InitService);
	
	public readonly signalIsCheckEnabled = signal<boolean>(false);
	public readonly signalTimerSeconds = signal<number>(120);
	
	private startUrls: Array<string>;
	
	constructor()
	{
		this.startUrls = [
			AppRoutesEnum.base,
			AppRoutesEnum.idle
		].map((value) => {
			return '/' + value;
		});
	}
	
	public updateRoute(url: string): void
	{
		this.signalIsCheckEnabled.set(this.startUrls.indexOf(url) === -1);
		this.resetTimer();
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
		this.signalTimerSeconds.set(this.initService.appConfig.stillThereSeconds);
	}
}
