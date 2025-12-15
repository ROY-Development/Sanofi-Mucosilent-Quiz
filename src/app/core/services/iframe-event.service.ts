import {EventEmitter, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class IframeEventService
{
	private message = this.onMessage.bind(this);
	
	public readonly onUpdate = new EventEmitter<any>();
	
	public init(): void
	{
		window.addEventListener('message', this.message);
	}
	
	public destroy(): void
	{
		window.removeEventListener('message', this.message);
	}
	
	private onMessage(event: MessageEvent): void
	{
		if (event.origin !== environment.editorUrl) // safety check
		{
			return;
		}
		
		if (event.data.type === 'update')
		{
			// console.log(JSON.stringify(event.data));
			this.onUpdate.emit(event.data);
		}
	}
}
