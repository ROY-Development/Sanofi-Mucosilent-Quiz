import {Injectable, signal} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class BackgroundImageService
{
	public readonly signalState = signal<number>(0);
	public readonly signalUrl1 = signal<string | null>(null);
	public readonly signalUrl2 = signal<string | null>(null);
	
	public setBackgroundImageUrl(url: string | null): void
	{
		if (this.signalState() > 0 && !url)
		{
			this.signalState.set(0);
		}
		else if (this.signalState() === 0 && url)
		{
			this.signalState.set(1);
			this.signalUrl1.set('url(\'' + url + '\'');
		}
		else if (this.signalState() === 1 && url && !this.signalUrl1()?.includes(url))
		{
			this.signalState.set(2);
			this.signalUrl2.set('url(\'' + url + '\'');
		}
		else if (this.signalState() === 2 && url && !this.signalUrl2()?.includes(url))
		{
			this.signalState.set(1);
			this.signalUrl1.set('url(\'' + url + '\'');
		}
	}
	
	public updateRoute(url: string): void
	{
		if (url)
		{
			//
		}
		this.setBackgroundImageUrl(null);
	}
}
