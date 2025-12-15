import {Directive, ElementRef, inject, Input, OnInit} from '@angular/core';

@Directive({
	selector: '[appAutofocus]',
	standalone: false
})
export class AutofocusDirective implements OnInit
{
	private el = inject(ElementRef);
	
	private focus = true;
	
	@Input() public set autofocus(condition: boolean)
	{
		this.focus = condition;
	}
	
	public ngOnInit(): void
	{
		if (this.focus)
		{
			window.setTimeout(() => {
				this.el.nativeElement.focus();
			}, 0);
		}
	}
}
