import {Directive, ElementRef, HostListener, inject, Input} from '@angular/core';

@Directive({
	selector: '[appDownClass]',
	standalone: false
})
export class DownClassDirective
{
	private elementRef = inject(ElementRef);
	
	@Input('appDownClass') public downClass: any;
	
	private isTouchDown: boolean = false;
	
	@HostListener('mousedown', ['$event'])
	@HostListener('touchstart', ['$event'])
	protected onTouchDown(event: TouchEvent | MouseEvent): void
	{
		if (event)
		{
			//
		}
		
		this.isTouchDown = true;
		this.updateClass();
	}
	
	@HostListener('mouseup', ['$event'])
	@HostListener('touchend', ['$event'])
	@HostListener('mouseleave', ['$event'])
	@HostListener('mouseout', ['$event'])
	@HostListener('touchcancel', ['$event'])
	@HostListener('touchmove', ['$event'])
	protected onTouchUp(event: TouchEvent | MouseEvent): void
	{
		if (event)
		{
			//
		}
		
		this.isTouchDown = false;
		this.updateClass();
	}
	
	private updateClass(): void
	{
		if (this.isTouchDown)
		{
			this.elementRef.nativeElement.classList.add(this.downClass);
		}
		else
		{
			this.elementRef.nativeElement.classList.remove(this.downClass);
		}
	}
}

