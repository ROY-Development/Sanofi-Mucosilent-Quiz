import {interval, Subscription} from 'rxjs';
import {take} from 'rxjs/operators';

export class UtilTimeout
{
	constructor()
	{
	}
	
	public static setTimeout(callback: () => void, timeout: number = 0): Subscription
	{
		const subscription = interval(timeout).pipe(take(1)).subscribe(
			{
				next: () => {
					subscription.unsubscribe();
					callback();
				},
				error: (err) => {
					subscription.unsubscribe();
					callback();
				}
			}
		);
		
		return subscription;
	}
}
