import {ElementRef, EventEmitter, inject, Injectable} from '@angular/core';
import gsap from 'gsap';
import {NativeTranslateService} from './native-translate.service';

@Injectable({
	providedIn: 'root'
})
export class GameHeaderService
{
	private nativeTranslateService = inject(NativeTranslateService);
	
	public readonly onUpdateGameScore = new EventEmitter<void>();
	
	private startScore: number = 0;
	private targetScore: number = 0;
	private oldScore: number = 0;
	private scores: Array<number> = [];
	
	constructor()
	{
		gsap.registerEffect({
			name: "counter",
			extendTimeline: true,
			defaults: {
				start: 0,
				end: 0,
				duration: 0.5,
				ease: "bounce",
				increment: 1
			},
			effect: (targets: any, config: any) => {
				const tl: gsap.core.Timeline = gsap.timeline();
				targets[0].innerText = targets[0].innerText.replace(/,/g, '');
				
				tl.set(targets, {
					innerText: config.start
				})
				tl.to(targets, {
					duration: config.duration,
					innerText: config.end,
					//snap:{innerText:config.increment},
					modifiers: {
						innerText: (innerText) => {
							return gsap.utils.snap(config.increment, innerText)
								.toLocaleString(this.nativeTranslateService.currentLocale ?? 'en-US');//.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
						}
					},
					ease: config.ease,
					onComplete: config.onComplete
				}, 0);
				
				return tl;
			}
		});
	}
	
	public init(scoreRef: ElementRef<HTMLDivElement>): void
	{
		this.callScoreTween(scoreRef, null);
	}
	
	public resetGameScore(): void
	{
		this.startScore = 0;
		this.targetScore = 0;
		this.oldScore = 0;
		this.scores = [];
		
		this.onUpdateGameScore.emit();
	}
	
	public prepareGameScore(targetScore: number): void
	{
		this.scores.push(targetScore);
	}
	
	public updateGameScore(): void
	{
		if (this.scores.length > 0)
		{
			this.startScore = this.oldScore;
			this.targetScore = this.scores[0];
			this.oldScore = this.scores[0];
			this.scores.shift();
		}
		this.onUpdateGameScore.emit();
	}
	
	public callScoreTween(scoreRef: ElementRef<HTMLDivElement>, onComplete: (() => void) | null): void
	{
		const timeline: gsap.core.Timeline = gsap.timeline();
		gsap.killTweensOf(scoreRef.nativeElement);
		timeline.from(scoreRef.nativeElement, {opacity: 1});
		timeline.counter(scoreRef.nativeElement, {
			start: this.startScore,
			end: this.targetScore,
			ease: "linear",
			onComplete: () => {
				if (
					onComplete &&
					this.targetScore > 0
				)
				{
					onComplete();
				}
			}
		}, "-=0.5");
	}
	
	public callScoreIconTween(scoreIconRef: ElementRef<HTMLDivElement>, onComplete: (() => void) | null): void
	{
		const timeline: gsap.core.Timeline = gsap.timeline();
		gsap.killTweensOf(scoreIconRef.nativeElement);
		timeline
			.to(scoreIconRef.nativeElement, {y: -15, rotation: -15, duration: 0.5, ease: "power1.out"})
			.to(scoreIconRef.nativeElement, {y: 0, rotation: 0, duration: 0.25, ease: "power1.in"})
			.to(scoreIconRef.nativeElement, {y: -10, rotation: 10, duration: 0.5, ease: "power1.out"})
			.to(scoreIconRef.nativeElement, {y: -12, rotation: -15, duration: 0.5, ease: "power1.out"})
			.to(scoreIconRef.nativeElement, {
				y: 0, rotation: 0, duration: 0.25, ease: "power1.in",
				onComplete: () => {
					if (onComplete)
					{
						onComplete();
					}
				}
			});
	}
}
