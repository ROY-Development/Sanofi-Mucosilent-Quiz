import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {RequestOptionsModel} from '../../shared/models/request-options.model';
import {HttpMethodsEnum} from '../../shared/enums/http-methods.enum';
import {catchError, finalize, map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {UtilHttp} from '../../shared/utils/util-http';

@Injectable()
export class BaseService
{
	protected httpClient = inject(HttpClient);
	
	public readonly isLoading$ = new BehaviorSubject<boolean>(false);
	public readonly error$ = new BehaviorSubject<string | null>(null);
	
	protected loadingCount: number = 0;
	protected savedStartTime: number = 0;
	protected _loadingTime: number = 0;
	protected _error: string | null = null;
	protected _debounceTimer: number = -1;
	protected _isBlockingLoading: boolean = false;
	
	public get isLoading(): boolean
	{
		return (this.loadingCount > 0);
	}
	
	public get isBlockingLoading(): boolean
	{
		return this._isBlockingLoading;
	}
	
	public get loadingTime(): number
	{
		return this._loadingTime;
	}
	
	public get error(): string | null
	{
		return this._error;
	}
	
	public resetError(): void
	{
		this._error = null;
		this.error$.next(this._error);
	}
	
	public debounceBlockLoading(milliSeconds: number): void
	{
		if (this._debounceTimer !== -1)
		{
			clearTimeout(this._debounceTimer);
			this._debounceTimer = -1;
		}
		else
		{
			this._isBlockingLoading = true;
		}
		
		this._debounceTimer = window.setTimeout(
			() => {
				this._isBlockingLoading = false;
				this._debounceTimer = -1;
			},
			milliSeconds
		);
	}
	
	protected doHttpRequest<T>(
		requestOptions: RequestOptionsModel,
		callbackComplete: (httpResponse: HttpResponse<any>) => T | null,
		callbackError: (error: any) => void,
		callbackFinally: (() => void) | null = null,
		contentType: string | null = 'application/json; charset=UTF-8',
		isBlobResponse: boolean = false
	): Observable<T>
	{
		this.incrementLoadingCount();
		this._error = null;
		this.savedStartTime = performance.now();
		
		return BaseService.doHttpRequest(
			this.httpClient,
			requestOptions,
			(httpResponse: HttpResponse<any>): T | null => {
				return callbackComplete(this.onLoadComplete(httpResponse));
			},
			callbackError,
			() => {
				this.onLoadFinally();
				if (callbackFinally !== null)
				{
					callbackFinally();
				}
			},
			contentType,
			isBlobResponse
		);
	}
	
	protected incrementLoadingCount(): void
	{
		this.loadingCount++;
		window.setTimeout(
			() => {
				this.isLoading$.next(this.isLoading);
			}, 0
		);
	}
	
	protected decrementLoadingCount(): void
	{
		this.loadingCount--;
		this.loadingCount = Math.max(0, this.loadingCount);
		window.setTimeout(
			() => {
				this.isLoading$.next(this.isLoading);
			}, 10
		);
	}
	
	protected onLoadComplete<T>(response: HttpResponse<T>): HttpResponse<T>
	{
		return response;
	}
	
	protected onLoadError(errorResponse: HttpErrorResponse): Observable<string>
	{
		let error: any = errorResponse.error || 'ERROR';
		
		if (error instanceof ProgressEvent)
		{
			const error = new Error('Internet connection');
			return throwError(() => error);
		}
		else if (
			typeof error === "string" &&
			error.indexOf('The requested URL was not found on this server.') !== -1
		)
		{
			const error = new Error('Not found');
			return throwError(() => error);
		}
		else if (error instanceof Object)
		{
			error = error.text || error.message || error.error || error;
		}
		this._error = error;
		this.error$.next(error);
		return throwError(() => error);
	}
	
	// is called every time after onComplete, onError, onCancel
	protected onLoadFinally(): void
	{
		this.decrementLoadingCount();
		this._loadingTime = Math.round(performance.now() - this.savedStartTime);
	}
	
	public static doHttpRequest(
		httpClient: HttpClient,
		requestOptions: RequestOptionsModel,
		callback: any,
		callbackError: any,
		callbackFinally: any,
		contentType: string | null = 'application/json; charset=UTF-8',
		isBlobResponse: boolean = false
	): Observable<any>
	{
		let headers: any = requestOptions.headerParams;
		
		if (contentType !== null)
		{
			if (headers && typeof headers === 'object')
			{
				headers['Content-Type'] = contentType;
			}
			else
			{
				headers = new HttpHeaders({'Content-Type': contentType});
			}
		}
		
		if (requestOptions.httpMethod === HttpMethodsEnum.post)
		{
			return httpClient.post(requestOptions.getUrl(), requestOptions.bodyParams, {
				headers: headers,
				observe: 'response',
				responseType: isBlobResponse ? 'blob' as 'json' : 'json'
			})
				.pipe(map(callback), catchError(callbackError), finalize(callbackFinally));
		}
		else if (requestOptions.httpMethod === HttpMethodsEnum.get)
		{
			return httpClient.get(requestOptions.getUrl(), {
				headers: headers,
				observe: 'response',
				responseType: isBlobResponse ? 'blob' as 'json' : 'json'
			})
				.pipe(map(callback), catchError(callbackError), finalize(callbackFinally));
		}
		else if (requestOptions.httpMethod === HttpMethodsEnum.put)
		{
			return httpClient.put(requestOptions.getUrl(), requestOptions.bodyParams, {
				headers: headers,
				observe: 'response',
				responseType: isBlobResponse ? 'blob' as 'json' : 'json'
			})
				.pipe(map(callback), catchError(callbackError), finalize(callbackFinally));
		}
		else if (requestOptions.httpMethod === HttpMethodsEnum.delete)
		{
			return httpClient.request(
				'delete',
				requestOptions.getUrl(),
				{
					body: requestOptions.bodyParams, headers: headers, observe: 'response',
					responseType: isBlobResponse ? 'blob' as 'json' : 'json'
				}
			)
				.pipe(map(callback), catchError(callbackError), finalize(callbackFinally));
		}
		else if (requestOptions.httpMethod === HttpMethodsEnum.head)
		{
			return httpClient.head(requestOptions.getUrl(), {
				headers: headers, observe: 'response',
				responseType: isBlobResponse ? 'blob' as 'json' : 'json'
			})
				.pipe(map(callback), catchError(callbackError), finalize(callbackFinally));
		}
		else if (requestOptions.httpMethod === HttpMethodsEnum.patch)
		{
			return httpClient.patch(requestOptions.getUrl(), requestOptions.bodyParams, {
				headers: headers,
				observe: 'response',
				responseType: isBlobResponse ? 'blob' as 'json' : 'json'
			})
				.pipe(map(callback), catchError(callbackError), finalize(callbackFinally));
		}
		
		return of(null);
	}
	
	public static isModelFullySet(model: any): boolean
	{
		if (!model || typeof model !== 'object')
		{
			return false;
		}
		
		model = JSON.parse(JSON.stringify(model)); // removes all methods
		
		for (const key in model)
		{
			if (Object.prototype.hasOwnProperty.call(model, key))
			{
				const value: any = model[key];
				if (!value)
				{
					return false;
				}
			}
		}
		
		return true;
	}
	
	// Returns base href with ending slash
	public static getBaseHref(): string
	{
		const baseTag: HTMLBaseElement | null = document.querySelector('base');
		let href: string = baseTag?.getAttribute('href') || window.location.pathname || '/';
		
		// If path ends with file name (e.q. index.html), then use the folder path
		if (href.match(/\.[a-z0-9]+$/i))
		{
			const lastSlash = href.lastIndexOf('/');
			href = lastSlash !== -1 ? href.slice(0, lastSlash + 1) : '/';
		}
		
		// End everytime with a slash
		if (!href.endsWith('/'))
		{
			href += '/';
		}
		return href;
	}
	
	public static getBaseApiUrl(): string
	{
		if (UtilHttp.isLocalHost() && window.location.port !== '')
		{
			return window.location.origin + environment.localhostBaseUrl;
		}
		
		return BaseService.getBaseHref(); // window.location.origin + '/';
	}
	
	protected static getHeadersValueByKey(httpResponse: HttpResponse<any>, key: string): string | null
	{
		if (httpResponse && httpResponse.headers)
		{
			const headers: HttpHeaders = httpResponse.headers;
			const keys: Array<string> = headers.keys();
			
			if (keys.indexOf(key) !== -1)
			{
				return headers.get(key);
			}
		}
		
		return '';
	}
}
