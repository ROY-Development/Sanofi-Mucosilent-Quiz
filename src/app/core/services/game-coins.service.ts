import {EventEmitter, inject, Injectable, signal} from '@angular/core';
import gsap from 'gsap';
import {ImageLoadService} from './image-load.service';

class Coin
{
	constructor(
		public index: number,
		public timelinePromise: gsap.core.Timeline | null,
		public divElement: HTMLDivElement | null
	)
	{
	}
}

@Injectable({
	providedIn: 'root'
})
export class GameCoinsService
{
	private imageLoadService = inject(ImageLoadService);
	
	public readonly signalIsRotatingFlyingAni = signal<boolean>(false);
	
	public frontImageUrl: string = 'none';
	public backImageUrl: string = 'none';
	
	public coinLists: Array<Array<Coin>> = [];
	
	private startX: number = 0;
	private startY: number = 0;
	private targetX: number = 0;
	private targetY: number = 0;
	private onShrink: (() => void) | null = null;
	private onComplete: (() => void) | null = null;
	
	public readonly onInitComplete = new EventEmitter<void>();
	public readonly onAnimationComplete = new EventEmitter<void>();
	
	constructor()
	{
	}
	
	public init(isRotatingFlyingAni: boolean): void
	{
		this.signalIsRotatingFlyingAni.set(isRotatingFlyingAni);
		
		let image: HTMLImageElement | null;
		
		image = this.imageLoadService.getImage('crabFrontImage');
		if (image)
		{
			this.frontImageUrl = `url('${image.src}')`;
		}
		
		image = this.imageLoadService.getImage('crabBackImage');
		if (image)
		{
			this.backImageUrl = `url('${image.src}')`;
		}
	}
	
	public start(
		startX: number,
		startY: number,
		targetX: number,
		targetY: number,
		count: number,
		onShrink: (() => void) | null,
		onComplete: (() => void) | null
	): void
	{
		if (this.backImageUrl === 'none' && this.frontImageUrl === 'none')
		{
			if (onShrink)
			{
				onShrink();
			}
			if (onComplete)
			{
				onComplete();
			}
			
			return;
		}
		
		this.startX = startX;
		this.startY = startY;
		this.targetX = targetX;
		this.targetY = targetY;
		if (onShrink)
		{
			this.onShrink = onShrink;
		}
		if (onComplete)
		{
			this.onComplete = onComplete;
		}
		
		const coins = [];
		for (let i = 0; i < count; ++i)
		{
			coins.push({index: i, timelinePromise: null, divElement: null});
		}
		this.coinLists.push(coins);
		
		this.onInitComplete.emit();
	}
	
	public stop(): void
	{
		for (const coinList of this.coinLists)
		{
			for (const coin of coinList)
			{
				if (coin.timelinePromise)
				{
					coin.timelinePromise = null;
				}
				if (coin.divElement)
				{
					gsap.killTweensOf(coin.divElement);
					gsap.killTweensOf(coin.divElement.getElementsByClassName('coin-inner')[0]);
					coin.divElement = null;
				}
			}
		}
		this.coinLists = [];
	}
	
	public callTween(coinElemList: Array<HTMLDivElement>): void
	{
		let index: number = 0;
		const latestCoinList: Array<Coin> = this.coinLists[this.coinLists.length - 1];
		
		let elemListIndex: number;
		let elemIndex: number;
		
		for (const elem of coinElemList)
		{
			elemListIndex = parseInt(elem.dataset.listIndex!, 10);
			elemIndex = parseInt(elem.dataset.index!, 10);
			
			// if it is from another list
			if (elemListIndex !== this.coinLists.length - 1)
			{
				continue;
			}
			
			gsap.killTweensOf(elem);
			gsap.killTweensOf(elem.getElementsByClassName('coin-inner')[0]);
			
			gsap.set(elem, {
				x: this.startX + -10 + Math.random() * 20,
				y: this.startY + -10 + Math.random() * 20,
				scale: 0.6
			});
			gsap.set(elem.getElementsByClassName('coin-inner')[0], {
				animationDelay: 0, //Math.random() * 0.3 + 0.7,
				animationDuration: Math.random() * 1.7 + 0.2,
				animationDirection: Math.round(Math.random()) === 1 ? 'normal' : 'reverse'
			});
			
			latestCoinList[index].divElement = elem;
			latestCoinList[index].timelinePromise = gsap.timeline();
			latestCoinList[index].timelinePromise!
				.to(elem, {
					duration: Math.random() * 0.3 + 0.7,
					x: this.startX - 100 + Math.random() * 200,
					y: this.startY - 100 + Math.random() * 200,
					scale: 1,
					ease: "power1"
				})
				.to(elem, {
					duration: 2 + Math.random() * 0.3,
					x: this.targetX - 5 + Math.random() * 10,
					y: this.targetY - 5 + Math.random() * 10,
					ease: "power1"
				})
				.call(() => {
					elemIndex = parseInt(elem.dataset.index!, 10);
					if (elemIndex === 0)
					{
						if (this.onShrink)
						{
							this.onShrink();
						}
					}
				})
				.to(elem, {
					duration: 0.6 + Math.random() * 0.3,
					opacity: 0,
					scale: 0.5,
					ease: "power1"
				})
				.then(() => {
					gsap.killTweensOf(elem);
					gsap.killTweensOf(elem.getElementsByClassName('coin-inner')[0]);
					
					let removeIndex = -1;
					
					elemIndex = parseInt(elem.dataset.index!, 10);
					
					for (let i = 0, n = latestCoinList.length; i < n; ++i)
					{
						if (latestCoinList[i].index === elemIndex)
						{
							removeIndex = i;
							break;
						}
					}
					
					//let str = '';
					
					if (removeIndex >= 0)
					{
						latestCoinList.splice(removeIndex, 1);
					}
					
					/*for (let i = 0, n = latestCoinList.length; i < n; ++i)
					{
						str += latestCoinList[i].index + ', ';
					}*/
					
					if (latestCoinList.length <= 0)
					{
						this.coinLists.splice(this.coinLists.indexOf(latestCoinList), 1);
						
						if (this.onComplete)
						{
							this.onComplete();
						}
						
						// console.log('onComplete all', this.coinLists);
						
						if (this.coinLists.length <= 0)
						{
							this.onAnimationComplete.emit();
						}
					}
				});
			
			index++;
		}
	}
}
