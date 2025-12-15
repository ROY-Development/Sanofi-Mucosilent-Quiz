import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ImageLoadService
{
	private images: Array<HTMLImageElement> = [];
	
	public readonly addImageEmitter = new EventEmitter<string>();
	
	public addImage(id: string, urlOrBlob: string | Blob): void
	{
		let image: HTMLImageElement | null = this.getImage(id);
		
		if (image)
		{
			this.removeImage(id);
		}
		
		image = new Image();
		image.id = id;
		if (typeof (urlOrBlob) === 'string')
		{
			image.src = urlOrBlob;
		}
		else if (urlOrBlob instanceof Blob)
		{
			image.src = URL.createObjectURL(urlOrBlob);
		}
		
		this.images.push(image);
		
		this.addImageEmitter.emit(id);
	}
	
	public getImage(id: string): HTMLImageElement | null
	{
		for (const image of this.images)
		{
			if (image.id === id)
			{
				return image;
			}
		}
		
		return null;
	}
	
	public removeImage(id: string): void
	{
		const image: HTMLImageElement | null = this.getImage(id);
		
		if (!image)
		{
			return;
		}
		
		if (this.images.includes(image))
		{
			this.images.splice(this.images.indexOf(image), 1);
		}
	}
}
