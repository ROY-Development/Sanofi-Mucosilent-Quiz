import {ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {ToastService} from './toast.service';
import {ToastModel} from './toast.model';
import {Subscription} from 'rxjs';
import {ToastTypeEnum} from './toast-type-enum';

@Component({
	selector: 'app-toast',
	templateUrl: './toast.component.html',
	styleUrl: './toast.component.scss',
	standalone: false
})
export class ToastComponent implements OnInit, OnDestroy
{
	protected toastService = inject(ToastService);
	private changeDetectorRef = inject(ChangeDetectorRef);
	
	@Input() public fontSize: number = 16;
	
	protected readonly ToastTypeEnum = ToastTypeEnum;
	
	private eventSubscription: Subscription | null = null;
	
	public ngOnInit(): void
	{
		this.eventSubscription = this.toastService.eventEmitter.subscribe(() => {
			this.changeDetectorRef.detectChanges();
		})
	}
	
	public ngOnDestroy(): void
	{
		if (this.eventSubscription)
		{
			this.eventSubscription.unsubscribe();
			this.eventSubscription = null;
		}
	}
	
	protected onClickToast(toast: ToastModel): void
	{
		this.toastService.removeToast(toast);
	}
}
