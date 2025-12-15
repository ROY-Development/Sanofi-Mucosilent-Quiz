import {EventEmitter, Injectable, signal} from '@angular/core';
import {UtilTimeout} from '../../utils/util-timeout';
import {Subscription} from 'rxjs';
import {ToastModel} from './toast.model';
import {ToastTypeEnum} from './toast-type-enum';

@Injectable({
	providedIn: 'root'
})
export class ToastService
{
	public readonly signalToastMessages = signal<Array<ToastModel>>([]);
	private messageSubscription: Subscription | null = null;
	
	public readonly eventEmitter: EventEmitter<void> = new EventEmitter<void>();
	
	public showToast(
		message: string,
		type: ToastTypeEnum = ToastTypeEnum.info,
		duration: number = 3000
	): void
	{
		const toast: ToastModel = new ToastModel(
			message,
			type,
			duration
		);
		
		const toastMessages = this.signalToastMessages();
		
		// check if the message already exists
		if (toastMessages.some(existingToast => existingToast.message === toast.message))
		{
			return;
		}
		toastMessages.push(toast);
		
		this.updateToasts(toastMessages);
		
		if (!this.messageSubscription)
		{
			this.processQueue(duration);
		}
	}
	
	public removeToast(toast: ToastModel): void
	{
		const toastMessages = this.signalToastMessages();
		const toastIndex = toastMessages.indexOf(toast);
		
		if (toastIndex !== -1)
		{
			toastMessages.splice(toastIndex, 1);
		}
		
		this.updateToasts(toastMessages);
		
		if (this.signalToastMessages().length === 0)
		{
			this.messageSubscription?.unsubscribe();
			this.messageSubscription = null;
			return;
		}
	}
	
	private processQueue(duration: number): void
	{
		if (this.signalToastMessages().length === 0)
		{
			this.messageSubscription?.unsubscribe();
			this.messageSubscription = null;
			return;
		}
		
		this.messageSubscription = UtilTimeout.setTimeout(() => {
			// array pop (shift)
			this.signalToastMessages.update((currentMessages) => currentMessages.slice(1));
			this.processQueue(duration);
		}, duration);
	}
	
	private updateToasts(toastMessages: Array<ToastModel>): void
	{
		this.signalToastMessages.set(toastMessages);
		
		for (let i = 0, n = toastMessages.length; i < n; ++i)
		{
			toastMessages[i].top = (n - 1 - i) * 50;
		}
		
		this.eventEmitter.emit();
	}
}
