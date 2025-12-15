import {EventEmitter, Injectable, signal} from '@angular/core';
import gsap from 'gsap';
import {UtilArray} from '../../shared/utils/util-array';
import {AppRoutesEnum} from '../../app-routes.enum';
import {BackgroundAnimationTypeEnum} from '../../shared/enums/background-animation-type.enum';

class Image
{
	constructor(
		public index: number,
		public elem: HTMLDivElement,
		public timelinePromise: gsap.core.Timeline | null
	)
	{
	}
}

@Injectable({
	providedIn: 'root'
})
export class BackgroundAnimationService
{
	public readonly signalImageUrls = signal<Array<{ fileName: string, url: string, nr: number }>>([]);
	
	public imageList: Array<Image> = [];
	
	private imageUrls: Array<{ fileName: string, url: string }> = [];
	private animType: BackgroundAnimationTypeEnum = BackgroundAnimationTypeEnum.oneStep;
	private appHeight: number = 1920 + 50;
	
	public readonly onInitComplete = new EventEmitter<void>();
	
	constructor()
	{
		this.init();
	}
	
	public init(): void
	{
		this.setImages([], BackgroundAnimationTypeEnum.oneStep);
	}
	
	public onResize(appHeight: number): void
	{
		this.appHeight = appHeight + 50;
	}
	
	public setImageUrls(imageUrls: Array<string>, animType: number): void
	{
		const list: Array<{ fileName: string, url: string }> = [];
		
		for (const imageUrl of imageUrls)
		{
			const fileNameWithoutExtension: string = imageUrl.split('/').pop()?.replace(/\.[^/.]+$/, '') ?? '---';
			list.push({fileName: fileNameWithoutExtension, url: imageUrl})
		}
		
		this.setImages(list, animType);
	}
	
	public setImages(
		imageUrls: Array<{ fileName: string, url: string }>,
		animType: BackgroundAnimationTypeEnum
	): void
	{
		const list1: Array<string> = [];
		const list2: Array<string> = [];
		for (const imageUrl of imageUrls)
		{
			list1.push(imageUrl.fileName);
		}
		for (const imageUrl of this.imageUrls)
		{
			list2.push(imageUrl.fileName);
		}
		
		if (
			animType === this.animType &&
			UtilArray.areArraysEqual(list1, list2)
		)
		{
			return; // don't change anything if images are the same
		}
		
		this.imageUrls = imageUrls;
		this.animType = animType;
		
		for (const image of this.imageList)
		{
			gsap.killTweensOf(image.elem);
			image.timelinePromise?.kill();
		}
		this.imageList = [];
		
		const urls: Array<{ fileName: string, url: string, nr: number }> = [];
		
		let url: string;
		let i: number = 0;
		for (const imageUrl of imageUrls)
		{
			if (imageUrl.url && imageUrl.fileName)
			{
				url = imageUrl.url.startsWith('url(') ? imageUrl.url : `url('${imageUrl.url}')`;
				
				urls.push({fileName: imageUrl.fileName, url: url, nr: i + 1});
				i++;
			}
		}
		
		this.signalImageUrls.set(urls);
		
		this.onInitComplete.emit();
	}
	
	public addImage(fileName: string, url: string): void
	{
		const list: Array<{ fileName: string, url: string }> = [...this.imageUrls];
		list.push({fileName: fileName, url: url});
		
		this.setImages(list, this.animType);
	}
	
	public removeImage(fileName: string): void
	{
		const list = [...this.imageUrls];
		const index: number = list.findIndex((value) => {
			return value.fileName.endsWith(fileName)
		});
		
		if (index !== -1)
		{
			list.splice(index, 1);
		}
		
		/*const list = this.imageUrls.filter((value) => {
			return !value.fileName.endsWith(fileName);
		});*/
		
		this.setImages(list, this.animType);
		
		/*const index: number = this.imageUrls.findIndex((value) => {
			return value.endsWith(fileName + '.png')
		});
		
		if (index !== -1)
		{
			const image = this.imageList[index];
			if (image)
			{
				image.timelinePromise?.kill();
				image.timelinePromise = null;
				gsap.killTweensOf(image.elem);
				this.imageList.splice(index, 1);
				
				const updated = [...this.imageUrls];
				updated.splice(index, 1);
				this.imageUrls = updated;
				
				const imUrls = [];
				let i = 0;
				for (const url of this.imageUrls)
				{
					imUrls.push({index: i, url: url});
					i++;
				}
				this.signalImageUrls.set(imUrls);
				this.onInitComplete.emit();
			}
		}*/
	}
	
	public updateRoute(
		url: string,
		backgroundAnimationImageUrls: Array<string> | null,
		animType: BackgroundAnimationTypeEnum
	): void
	{
		if (
			backgroundAnimationImageUrls && (
				url === '/' + AppRoutesEnum.base ||
				url === '/' + AppRoutesEnum.idle ||
				url === '/' + AppRoutesEnum.start ||
				url.startsWith('/' + AppRoutesEnum.highScore) ||
				url === '/' + AppRoutesEnum.howToPlay ||
				url === '/' + AppRoutesEnum.gameTopic ||
				url === '/' + AppRoutesEnum.endGameCrm ||
				url === '/' + AppRoutesEnum.endGame
			)
		)
		{
			if (backgroundAnimationImageUrls) // per question
			{
				this.setImageUrls(backgroundAnimationImageUrls!, animType);
			}
		}
		else
		{
			this.init();
		}
	}
	
	public callTween(imageElemList: Array<HTMLDivElement>): void
	{
		//let index: number = 0;
		let image: Image;
		let delay: number = Math.random() * 2;
		
		let elemIndex: number;
		
		for (const elem of imageElemList)
		{
			elemIndex = parseInt(elem.dataset.index!, 10);
			//	if (elem.dataset.running === 'false')
			{
				elem.dataset.running = "true";
				image = new Image(elemIndex, elem, null);
				this.addTween(image, elem, delay);
				
				delay += Math.random() * 2 + 4;
			}
			//index++;
		}
	}
	
	private addTween(
		image: Image,
		elem: HTMLDivElement,
		delay: number
	): void
	{
		if (this.animType === BackgroundAnimationTypeEnum.oneStep)
		{
			this.addTweenOneStep(image, elem, delay);
		}
		else if (this.animType === BackgroundAnimationTypeEnum.twoSteps)
		{
			this.addTweenThreeSteps(image, elem, delay);
		}
	}
	
	private getDistance(x1: number, y1: number, x2: number, y2: number): number
	{
		const deltaX: number = x2 - x1;
		const deltaY: number = y2 - y1;
		return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	}
	
	private addTweenOneStep(image: Image, elem: HTMLDivElement, delay: number): void
	{
		gsap.killTweensOf(elem);
		
		const startX: number = 80 + Math.random() * 1000;
		const startY: number = this.appHeight;
		const startRotation = Math.random() * -120 + 60;
		const endRotation2 = Math.random() * -120 + 60;
		const targetX: number = -200 + Math.random() * 1280;
		const targetY: number = -100;
		const duration: number = 10;
		
		gsap.set(elem, {
			x: startX,
			y: startY,
			rotate: startRotation,
			scale: 0.6,
			opacity: 0
		});
		
		image.timelinePromise = gsap.timeline();
		image.timelinePromise!
			.to(elem, {
				delay: delay - 1,
				duration: 1,
				x: startX,
				y: startY,
				scale: 1,
				ease: "none"
			})
			.to(elem, {
				delay: delay,
				duration: Math.random() * 0.3 + 0.7,
				x: startX,
				y: startY,
				scale: 1,
				opacity: 1,
				ease: "none"
			})
			.to(elem, {
				duration: duration,
				x: targetX,
				y: targetY,
				rotate: endRotation2,
				scale: 1,
				ease: "sine.inOut"
			})
			.then(() => {
				gsap.killTweensOf(elem);
				this.addTween(image, elem, Math.random() * 2 + 2);
			});
		
		this.imageList.push(image);
	}
	
	private addTweenThreeSteps(image: Image, elem: HTMLDivElement, delay: number): void
	{
		gsap.killTweensOf(elem);
		
		const startX: number = 80 + Math.random() * 1000;
		const startY: number = this.appHeight;
		const startRotation = Math.random() * -120 + 60;
		const endRotation1 = Math.random() * -120 + 60;
		const endRotation2 = Math.random() * -120 + 60;
		const targetX1: number = -200 + Math.random() * 1280;
		const targetY1: number = 1620 * Math.random();
		const targetX2: number = -200 + Math.random() * 1280;
		const targetY2: number = -100;
		
		const distance1: number = this.getDistance(startX, startY, targetX1, targetY1);
		const distance2: number = this.getDistance(targetX1, targetY1, targetX2, targetY2);
		
		const duration1: number = 10 * ((distance1) / this.appHeight);// + Math.random() * 3;
		const duration2: number = 10 * ((distance2) / this.appHeight);// + Math.random() * 3;
		
		gsap.set(elem, {
			x: startX,
			y: startY,
			rotate: startRotation,
			scale: 0.6,
			opacity: 0
		});
		
		image.timelinePromise = gsap.timeline();
		image.timelinePromise!
			.to(elem, {
				delay: delay - 1,
				duration: 1,
				x: startX,
				y: startY,
				scale: 1,
				ease: "none"
			})
			.to(elem, {
				delay: delay,
				duration: Math.random() * 0.3 + 0.7,
				x: startX,
				y: startY,
				scale: 1,
				opacity: 1,
				ease: "none"
			})
			.to(elem, {
				duration: duration1,
				x: targetX1,
				y: targetY1,
				rotate: endRotation1,
				scale: 1.5 * Math.random() + 0.5,
				ease: "sine.inOut"
			})
			.to(elem, {
				duration: duration2,
				x: targetX2,
				y: targetY2,
				rotate: endRotation2,
				scale: 1,
				ease: "sine.inOut"
			})
			.then(() => {
				gsap.killTweensOf(elem);
				this.addTween(image, elem, Math.random() * 2 + 2);
			});
		
		this.imageList.push(image);
	}
}
