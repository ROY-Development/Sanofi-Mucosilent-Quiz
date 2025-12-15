import {inject, Injectable, NgZone, signal, WritableSignal} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject, Observable} from 'rxjs';
import {AppConfigModel} from '../../shared/models/app-config.model';
import {UtilBrowser} from '../../shared/utils/util-browser';
import {BaseService} from './base.service';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {RequestOptionsModel} from '../../shared/models/request-options.model';
import {HttpMethodsEnum} from '../../shared/enums/http-methods.enum';
import {AppQueryParamsModel} from '../../shared/models/app-query-params.model';
import {AppRoutesEnum} from '../../app-routes.enum';
import {ViewTransitionService} from './view-transition.service';

@Injectable({
	providedIn: 'root'
})
export class InitService extends BaseService
{
	public viewTransitionService = inject(ViewTransitionService);
	
	public qz: string | null = inject<string | null>('APP_QUIZ_ID' as any);
	public isScormPackage: boolean = inject<boolean>('IS_SCORM_PACKAGE' as any);
	private router = inject(Router);
	private ngZone = inject(NgZone);
	
	public appConfig: AppConfigModel;
	public readonly signalAppConfig: WritableSignal<AppConfigModel>;
	public appQueryParams: AppQueryParamsModel;
	public readonly signalAppQueryParams: WritableSignal<AppQueryParamsModel>;
	public readonly signalReferrerUrl: WritableSignal<string>;
	public readonly signalLoadPercentage = signal<number>(0);

//	public windowType$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
	public readonly signalIsInitialisationComplete = signal<boolean>(false);
	public readonly signalIsLazyLoading = signal<boolean>(false);
	public readonly signalIsGoogleBot = signal<boolean>(false);
	
	public readonly signalBtnBackgroundImageUrl = signal<string>('none');
	
	public serverTime: Date = new Date();
	public serverTime$: BehaviorSubject<Date> = new BehaviorSubject<Date>(this.serverTime);
	
	public signalCurrentBrowser = signal<string>('');
	public signalIsChromeBrowser = signal<boolean>(false);

//	private urlHistory: string[] = [];
	private _isSelectedRouteValid: boolean = false;
	private currentRoute: string = '';
	private lastRoute: string = '';
	
	constructor()
	{
		super();
		
		// console.log('qz', qz);
		
		this.appConfig = AppConfigModel.getModelFromJson("{}");
		this.signalAppConfig = signal<AppConfigModel>(this.appConfig);
		
		// parse query params
		const urlSearchParams = new URLSearchParams(window.location.search);
		const params = Object.fromEntries((urlSearchParams as any).entries());
		this.appQueryParams = AppQueryParamsModel.getModelFromJson(params);
		this.signalAppQueryParams = signal<AppQueryParamsModel>(this.appQueryParams);
		this.signalReferrerUrl = signal<string>(document.referrer);
		
		// console.log("Referrer: " + this.signalReferrerUrl());
		
		this.signalCurrentBrowser.set(UtilBrowser.getCurrentBrowser());// + navigator.userAgent + navigator.platform + navigator.geolocation);
		this.signalIsChromeBrowser.set(
			!this.signalCurrentBrowser().includes('iPad') && (
				this.signalCurrentBrowser().includes('Chrome') || this.signalCurrentBrowser().includes('Electron')
			)
		);
		
		UtilBrowser.setOffContextMenu();
		UtilBrowser.preventDeveloperMenu();
		// UtilBrowser.stopBackButton();
		
		if (navigator.userAgent.indexOf('Googlebot') !== -1)
		{
			this.signalIsGoogleBot.set(true);
		}
		
		/*this.router.events.subscribe(
			{
				next: (event) => {
					if (event instanceof NavigationEnd)
					{
						this.urlHistory.push(event.urlAfterRedirects)
					}
				}
			}
		);*/
	}
	
	// localhost: 4200 /:4300 will be checked, and the url will be cleaned up
	public doDevUrlCleanup(): boolean
	{
		if (
			window.location.origin.includes(':4') &&
			window.location.href !== window.location.origin + '/' &&
			window.location.href !== window.location.origin &&
			window.location.href !== window.location.origin + '/' + window.location.search
		)
		{
			window.location.href = window.location.origin + '/' + window.location.search;
			return true;
		}
		
		return false;
	}
	
	public setInitialisationComplete(): void
	{
		this.signalIsInitialisationComplete.set(true);
	}
	
	public setAppConfig(appConfig: AppConfigModel): void
	{
		this.appConfig = appConfig;
		this.signalAppConfig.set(this.appConfig);
		console.log(this.appConfig);
	}
	
	public checkSelectedRoute(routeUrl: string): boolean
	{
		if (!this._isSelectedRouteValid)
		{
			this.lastRoute = '';
			this.currentRoute = '';
			this.navigateToRoute(AppRoutesEnum.base).then();
			return true;
		}
		
		this._isSelectedRouteValid = false;
		this.lastRoute = this.currentRoute;
		this.currentRoute = routeUrl;
		
		return false;
	}
	
	/*
	this navigateToRoute has a special qz as query param
	 */
	public async navigateToRoute(
		route: string,
		fragment: string | null = null,
		params: object | null = null,
		onTransitionFinished?: () => void
	): Promise<void | boolean>
	{
		const commands: Array<any> = [route];
		if (params)
		{
			commands.push(params);
		}
		
		const options: any = {
			queryParamsHandling: 'replace',
			onSameUrlNavigation: 'reload'
		};
		
		if (this.qz)
		{
			options.queryParams = {qz: this.qz};
		}
		
		options.onSameUrlNavigation = 'reload';
		
		if (fragment)
		{
			options.fragment = fragment;
		}
		
		this._isSelectedRouteValid = true;
		
		// Get current and target route
		const currentRouteUrl: string = this.router.url.split('?')[0];
		const targetRouteUrl: string = '/' + route;
		
		// Start the view transition with navigation
		let navigationResult: boolean = false;
		
		await this.viewTransitionService.startTransition(
			currentRouteUrl,
			targetRouteUrl,
			async () => {
				navigationResult = await this.ngZone.run(() =>
					this.router.navigate(commands, options).then(
						() => {
							// stop back button
							history.pushState(null, document.title, window.location.href);
							return true;
						}
					)
				);
			},
			onTransitionFinished
		);
		
		return navigationResult;
	}
	
	/*public navigateBack(): void
	{
		this.urlHistory.pop();
		if (this.urlHistory.length > 0)
		{
			this.location.back();
		}
		else
		{
			this.router.navigateByUrl('/').then();
		}
	}*/
	
	public getBaseConfig(): Observable<any | null>
	{
		const url: string = BaseService.getBaseApiUrl() + 'assets/json/base-config';
		const requestOptions: RequestOptionsModel = new RequestOptionsModel(
			url,
			HttpMethodsEnum.get,
			null,
			null,
			null,
			null,
			'.json'
		);
		
		return this.doHttpRequest<any | null>(
			requestOptions,
			(httpResponse: HttpResponse<any>): any | null => {
				if (httpResponse.body)
				{
					if (httpResponse.body.referrerURL)
					{
						/*if (!this.signalReferrerUrl().includes('cupratraininghub.com'))
						{
							this.signalReferrerUrl.set(httpResponse.body.referrerURL);
						}*/
						
						/*let locale: string = this.appQueryParams.localeRaw.replace('_', '-');
						if (this.appQueryParams.market.toUpperCase() === 'INT')
						{
							locale = this.appQueryParams.localeRaw.substring(0, 2);
						}

						this.signalReferrerUrl.set('https://cupratraininghub.com/' + locale + '/nugget/tc2024-cupra-qualifying');*/
						
						//console.log("Referrer: " + this.signalReferrerUrl());
					}
					
					return httpResponse.body;
				}
				
				// console.log(this.nfcUserStates);
				return null;// this.nfcUserStates;
			},
			(httpErrorResponse: HttpErrorResponse): Observable<string> => {
				return this.onLoadError(httpErrorResponse);
			}
		);
	}
	
	public send(
		bLang: string
	): Observable<Array<boolean>>
	{
		const body: any = {
			bl: bLang
		};
		
		if (this.signalIsGoogleBot())
		{
			body.ua = navigator.userAgent;
		}
		
		const url: string = BaseService.getBaseApiUrl() + 'api/init';
		const requestOptions: RequestOptionsModel = new RequestOptionsModel(
			url,
			HttpMethodsEnum.post,
			null,
			null,
			null,
			body
		);
		
		return this.doHttpRequest<any>(
			requestOptions,
			(httpResponse: HttpResponse<any>): boolean => {
				if (Object.hasOwn(httpResponse.body, 'time'))
				{
					this.serverTime = new Date(httpResponse.body.time);
				}
				else
				{
					this.serverTime = new Date();
				}
				
				this.serverTime$.next(this.serverTime);
				
				window.setTimeout(
					() => {
						this.setInitialisationComplete();
					}, 4000
				);
				
				return !!httpResponse.body;
			},
			(httpErrorResponse: HttpErrorResponse): Observable<string> => {
				this.serverTime = new Date();
				this.serverTime$.next(this.serverTime);
				
				return this.onLoadError(httpErrorResponse);
			}
		);
	}
}
