import {ElementRef, inject, Injectable, signal} from '@angular/core';
import {AppRoutesEnum} from '../../app-routes.enum';
import {VideoService} from './video.service';

@Injectable({
	providedIn: 'root'
})
export class PageService
{
	private videoService = inject(VideoService);
	
	public readonly signalIsExitButtonEnabled = signal<boolean>(false);
	public readonly signalVideoState = signal<number>(0);
	
	private exitButtonUrls: Array<string>;
	private videoBackgroundPachinkoUrls: Array<string>;
	
	// three videos
	// base video
	// pachinko
	// game task videos -> maybe
	
	constructor()
	{
		this.exitButtonUrls = [
			AppRoutesEnum.base,
			AppRoutesEnum.game,
			AppRoutesEnum.endGameCrm,
			AppRoutesEnum.endGame
		].map((value) => {
			return '/' + value;
		});
		
		this.videoBackgroundPachinkoUrls = [
		].map((value) => {
			return '/' + value;
		});
	}
	
	public updateRoute(url: string, videoElements: Array<ElementRef<HTMLVideoElement>>): void
	{
		this.signalIsExitButtonEnabled.set(this.exitButtonUrls.indexOf(url) !== -1);
		
		let videoState = 0;
		
		if (this.videoBackgroundPachinkoUrls.indexOf(url) !== -1)
		{
			videoState = 1;
		}
		
		if (this.signalVideoState() !== videoState)
		{
			if (videoState === 0)
			{
				this.videoService.showVideo('videoMain', videoElements);
			}
			else if (videoState === 1)
			{
				if (videoElements.length > 1)
				{
					videoElements[1].nativeElement.currentTime = 0;
				}
				this.videoService.showVideo('videoPachinko', videoElements);
			}
		}
		
		this.signalVideoState.set(videoState);
	}
}
