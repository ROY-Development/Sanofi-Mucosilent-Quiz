import {Directive, ElementRef, HostListener, inject, Input} from '@angular/core';

@Directive({
	selector: '[appHoverClass]',
	standalone: false
})
export class HoverClassDirective
{
	elementRef = inject(ElementRef);
	
	@Input('appHoverClass') public hoverClass: any;
	
	@HostListener('mouseenter')
	public onMouseEnter(): void
	{
		this.elementRef.nativeElement.classList.add(this.hoverClass);
	}
	
	@HostListener('mouseleave')
	public onMouseLeave(): void
	{
		this.elementRef.nativeElement.classList.remove(this.hoverClass);
	}
}
