import {AfterContentInit, Directive, ElementRef, inject, Input, OnDestroy} from '@angular/core';
import {UtilTimeout} from '../utils/util-timeout';
import {Subscription} from 'rxjs';

@Directive({
	selector: '[appTimeoutClass]',
	standalone: false
})
export class TimeoutClassDirective implements AfterContentInit, OnDestroy
{
	private elementRef: ElementRef<any> = inject(ElementRef);
	
	@Input('appTimeoutClass') public toClass: any;
	@Input() public fromClass: any | null = null;
	@Input() public timeout: number = 1000;
	@Input() public startCallback: (() => void) | null = null;
	
	private timeoutSubscription: Subscription | null = null;
	
	public ngAfterContentInit(): void
	{
		this.elementRef.nativeElement.classList.add(this.fromClass);
		
		this.timeoutSubscription = UtilTimeout.setTimeout(() => {
			if (this.fromClass)
			{
				this.elementRef.nativeElement.classList.remove(this.fromClass);
			}
			
			this.elementRef.nativeElement.classList.add(this.toClass);
			
			this.startCallback?.();
		}, this.timeout);
	}
	
	public ngOnDestroy(): void
	{
		if (this.timeoutSubscription)
		{
			this.timeoutSubscription.unsubscribe();
			this.timeoutSubscription = null;
		}
	}
}
