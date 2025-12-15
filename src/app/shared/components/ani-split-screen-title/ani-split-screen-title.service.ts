import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class AniSplitScreenTitleService
{
	public readonly eventEmitter: EventEmitter<string> = new EventEmitter<string>();
	
	public restart(): void
	{
		this.eventEmitter.emit('restart');
	}
}
