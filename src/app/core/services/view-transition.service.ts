import {Injectable} from '@angular/core';
import {AppRoutesEnum} from '../../app-routes.enum';

@Injectable({
	providedIn: 'root'
})
export class ViewTransitionService
{
	public isEnabled: boolean = false;
	private currentTransition: ViewTransition | null = null;
	
	public async startTransition(
		fromRoute: string,
		toRoute: string,
		onTransitionStart: () => void | Promise<void>,
		onTransitionFinished: (() => void) | null = null
	): Promise<void>
	{
		if (!('startViewTransition' in document))
		{
			// fallback: no view transition API available
			await onTransitionStart();
			return;
		}
		
		if (
			!this.isEnabled ||
			this.currentTransition ||
			fromRoute === toRoute
		)
		{
			await onTransitionStart();
			return; // prevent overlapping transitions
		}
		
		const animationType: string = this.getAnimationType(fromRoute, toRoute);
		
		document.documentElement.setAttribute('data-transition', animationType);
		
		// Start view transition
		this.currentTransition = document.startViewTransition(async () => {
			// Here the DOM is changing (Navigation)
			await onTransitionStart();
		});
		
		this.currentTransition.finished.then(() => {
			this.currentTransition = null;
			document.documentElement.removeAttribute('data-transition');
			
			if (onTransitionFinished)
			{
				onTransitionFinished();
			}
		}).catch((err: any) => {
			if (err)
			{
				//
			}
			// console.error('❌ Transition finished error:', err);
			document.documentElement.removeAttribute('data-transition');
			//		this.changeDetectorRef?.detectChanges();
		});
		
		// Wait until the transition is ready
		await this.currentTransition.ready;
	}
	
	/*
	^ = Begin of string
	\/ = One slash char escaped with \
	Replace only the first slash at the beginning
	 */
	private removeLeadingSlash(route: string): string
	{
		return route.replace(/^\//, '');
	}
	
	private getAnimationType(fromRoute: string, toRoute: string): string
	{
		fromRoute = this.removeLeadingSlash(fromRoute);
		toRoute = this.removeLeadingSlash(toRoute);
		
		if (
			// (fromRoute === AppRoutesEnum.base && toRoute === AppRoutesEnum.base) ||
			(fromRoute === AppRoutesEnum.base && toRoute === AppRoutesEnum.gameTopic) ||
			(fromRoute === AppRoutesEnum.gameTopic && toRoute === AppRoutesEnum.game)
		)
		{
			return 'fade-long';
		}
		else if (
			(fromRoute === AppRoutesEnum.game && toRoute === AppRoutesEnum.questionResult)
		)
		{
			return 'fade';
		}
		else if (
			(fromRoute === AppRoutesEnum.base && toRoute === AppRoutesEnum.howToPlay)
		)
		{
			return 'slide-left';
		}
		else if (
			(fromRoute === AppRoutesEnum.base && toRoute === AppRoutesEnum.howToPlay) ||
			(fromRoute === AppRoutesEnum.howToPlay && toRoute === AppRoutesEnum.base)
		)
		{
			return 'slide-right';
		}
		
		return 'fade';
	}
}