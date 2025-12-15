import {
	AfterViewInit,
	Directive,
	ElementRef,
	HostListener,
	inject,
	Input,
	OnChanges,
	Renderer2,
	SimpleChanges
} from '@angular/core';
import {UtilTimeout} from '../utils/util-timeout';

/*
	usage:
	<div style="height: 100px;" appAutoFitFont [maxFontSize]="30" [minFontSize]="10">
		{{ longText }}
	</div>
 */
@Directive({
	selector: '[appAutoFitFont]',
	standalone: false
})
export class AutoFitFontDirective implements AfterViewInit, OnChanges
{
	private el = inject(ElementRef);
	private renderer = inject(Renderer2);
	
	@Input() heightPx: number = 100;
	@Input() maxFontSize: number = 32;
	@Input() minFontSize: number = 16;
	
	public ngAfterViewInit(): void
	{
		this.resizeText();
		
		for (let i = 100; i <= 300; i += 100)
		{
			UtilTimeout.setTimeout(
				() => {
					const element: HTMLElement = this.el.nativeElement;
					this.renderer.setStyle(element, 'height', this.heightPx + 'px');
					this.resizeText();
				},
				i
			);
		}
	}
	
	public ngOnChanges(changes: SimpleChanges): void
	{
		if ('heightPx' in changes || 'maxFontSize' in changes || 'minFontSize' in changes)
		{
			const element: HTMLElement = this.el.nativeElement;
			this.renderer.setStyle(element, 'height', this.heightPx + 'px');
			this.resizeText();
		}
	}
	
	@HostListener('window:resize')
	public onResize(): void
	{
		this.resizeText();
	}
	
	private resizeText(): void
	{
		const element: HTMLElement = this.el.nativeElement;
		const parentWidth = element.clientWidth;
		const parentHeight: number = element.clientHeight;
		let fontSize: number = this.maxFontSize;
		
		// this.renderer.setStyle(element, 'white-space', 'normal');
		// this.renderer.setStyle(element, 'overflow', 'hidden');
		
		while (fontSize >= this.minFontSize)
		{
			this.renderer.setStyle(element, 'font-size', `${fontSize}px`);
			if (element.scrollHeight <= parentHeight && element.scrollWidth <= parentWidth)
			{
				break;
			}
			fontSize--;
		}
	}
}

