import {ElementRef, Injectable} from '@angular/core';
import {UtilTimeout} from '../../shared/utils/util-timeout';

@Injectable({
	providedIn: 'root'
})
export class VideoService
{
	public setVideoBlobInHTMLVideoElement(
		name: string,
		videoElements: Array<ElementRef<HTMLVideoElement>>,
		videoBlob: Blob
	): void
	{
		for (const video of videoElements)
		{
			if (video.nativeElement.id === name)
			{
				const newObjectUrl = URL.createObjectURL(videoBlob);
				
				// URLs created by `URL.createObjectURL` always use the `blob:` URI scheme: https://w3c.github.io/FileAPI/#dfn-createObjectURL
				const oldObjectUrl = video.nativeElement.currentSrc;
				if (oldObjectUrl && oldObjectUrl.startsWith('blob:'))
				{
					// It is crucial to revoke the previous ObjectURL to prevent memory leaks.
					// Un-set the `src` first.
					// See https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
					
					video.nativeElement.src = ''; // <-- Un-set the src property *before* revoking the object URL.
					URL.revokeObjectURL(oldObjectUrl);
				}
				
				if (video.nativeElement.hasChildNodes())
				{
					// revoke the previous ObjectURL from source tags
					const videoSources: HTMLCollectionOf<HTMLSourceElement> =
						video.nativeElement.getElementsByTagName('source');
					for (let i = 0, n = videoSources.length; i < n; i++)
					{
						{
							const videoSource: HTMLSourceElement = videoSources[i];
							const oldSource = videoSource.src;
							videoSource.src = '';
							URL.revokeObjectURL(oldSource);
						}
					}
					
					// remove source tags
					while (video.nativeElement.firstChild)
					{
						video.nativeElement.removeChild(video.nativeElement.firstChild);
					}
				}
				
				// Then set the new URL:
				//video.nativeElement.src = newObjectUrl;
				const htmlSource: HTMLSourceElement = document.createElement('source');
				htmlSource.src = newObjectUrl;
				htmlSource.type = videoBlob.type;
				video.nativeElement.appendChild(htmlSource);
				
				// And load it:
				video.nativeElement.load();
				
				break;
			}
		}
	}
	
	public showVideo(
		name: string,
		videoElements: Array<ElementRef<HTMLVideoElement>>
	): void
	{
		for (const video of videoElements)
		{
			if (video.nativeElement.id === name)
			{
				video.nativeElement.style.display = 'unset';
				
				this.tryPlay(video.nativeElement);
				UtilTimeout.setTimeout(
					() => {
						video.nativeElement.classList.add('show');
					}, 0
				);
			}
			else
			{
				video.nativeElement.classList.remove('show');
			}
		}
		
		UtilTimeout.setTimeout(
			() => {
				for (const video of videoElements)
				{
					if (video.nativeElement.id !== name)
					{
						video.nativeElement.style.display = 'none';
						video.nativeElement.pause();
					}
				}
			}, 800
		)
	}
	
	public tryPlay(video: HTMLVideoElement): void
	{
		let playAttempt: number = -1;
		tryPlay();
		
		function tryPlay(): void
		{
			video.play().then((): void => {
				if (playAttempt > -1)
				{
					clearInterval(playAttempt);
				}
			})
				.catch((): void => {
					// console.log("Unable to play the video, User has not interacted yet.");
					waitPlay();
				});
		}
		
		function waitPlay(): void
		{
			playAttempt = window.setTimeout(() => {
				tryPlay();
			}, 500);
		}
	}
}
