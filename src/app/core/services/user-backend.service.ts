import {Injectable, signal} from '@angular/core';
import {BaseService} from './base.service';
import {UserBackendModel} from '../../shared/models/user-backend.model';

@Injectable({
	providedIn: 'root'
})
export class UserBackendService extends BaseService
{
	// private initService = inject(InitService);
	
	public signalUserBackend = signal<UserBackendModel | null>(null);
	//private _userBackend: UserBackendModel | null = null;
	
	protected clientId: string = 'c-tc-24-gcloud';
	protected clientS: string = 'zJSkLxQH9gX2JV';
	//protected baseApiUrl: string = 'https://gcloud.cupra.tc.kamino-api.net:7284/'; // <- production / 'https://staging.kamino-api.net:7285/' <- staging
	//protected auth = Buffer.from(`${this.clientId}:${this.clientS}`).toString("base64"); // NodeJs
	protected auth = btoa(`${this.clientId}:${this.clientS}`);
	
	protected header: any = {
		Authorization: `Basic ${this.auth}`
	};
	
	/*public getGenerellAchievements(): Observable<any | null>
	{
		// const url: string = BaseService.getBaseApiUrl() + 'api/nfc-proxy/get-state';
		const url: string = this.baseApiUrl + 'gcloud/achievements';
		const requestOptions: RequestOptionsModel = new RequestOptionsModel(
			url,
			HttpMethodsEnum.get,
			null,
			null,
			this.header,
			null,
			''
		);
		
		return this.doHttpRequest<any | null>(
			requestOptions,
			(httpResponse: HttpResponse<any>): any | null => {
				if (httpResponse.body)
				{
					console.log(httpResponse.body);
				}
				
				return httpResponse.body;
			},
			(httpErrorResponse: HttpErrorResponse): Observable<string> => {
				return this.onLoadError(httpErrorResponse);
			}
		);
	}*/
	
	/*public get(userId: string): Observable<UserBackendModel | null>
	{
		if (userId.length <= 0)
		{
			return of(null);
		}
		
		const url: string = this.baseApiUrl + 'gcloud/user/meta';
		const requestOptions: RequestOptionsModel = new RequestOptionsModel(
			url,
			HttpMethodsEnum.post,
			null,
			null,
			this.header,
			{
				userID: userId
			},
			''
		);
		
		return this.doHttpRequest<any | null>(
			requestOptions,
			(httpResponse: HttpResponse<any>): UserBackendModel | null => {
				if (httpResponse.body)
				{
					this.setUserBackend(UserBackendModel.getModelFromJSON(httpResponse.body));
					
					return this._userBackend;
				}
				
				// console.log(this.nfcUserStates);
				return null;// this.nfcUserStates;
			},
			(httpErrorResponse: HttpErrorResponse): Observable<string> => {
				return this.onLoadError(httpErrorResponse);
			}
		);
	}*/
	
	/*public save(
		userId: string,
		acId: string,
		market: string,
		localeRaw: string,
		lastQuestionId: number,
		isCorrect: boolean,
		points: number | null = null
	): Observable<any | null>
	{
		const bodyParams: any = {
			userID: userId,
			acID: acId,
			market: market,
			languageKey: localeRaw,
			meta: lastQuestionId,
			correct: isCorrect
		};
		
		if (points)
		{
			bodyParams.points = points;
		}
		
		const url: string = this.baseApiUrl + 'gcloud/add';
		const requestOptions: RequestOptionsModel = new RequestOptionsModel(
			url,
			HttpMethodsEnum.post,
			null,
			null,
			this.header,
			bodyParams,
			''
		);
		
		return this.doHttpRequest<any | null>(
			requestOptions,
			(httpResponse: HttpResponse<any>): any | null => {
				if (httpResponse.body)
				{
					console.log(httpResponse.body);
				}
				
				return httpResponse.body;
			},
			(httpErrorResponse: HttpErrorResponse): Observable<string> => {
				return this.onLoadError(httpErrorResponse);
			}
		);
	}*/
	
	/*public deleteScore(userId: string, acId: string): Observable<any | null>
	{
		const url: string = this.baseApiUrl + 'gcloud/delete';
		const requestOptions: RequestOptionsModel = new RequestOptionsModel(
			url,
			HttpMethodsEnum.post,
			null,
			null,
			this.header,
			{
				userID: userId,
				acID: acId
			},
			''
		);
		
		return this.doHttpRequest<any | null>(
			requestOptions,
			(httpResponse: HttpResponse<any>): any | null => {
				if (httpResponse.body)
				{
					console.log(httpResponse.body);
					
					//this.setConnectedUserList(NfcUserStatesModel.getModelFromJSON(httpResponse.body));
					//AppBackendConfigModel.getModelFromJson(httpResponse.body.config));
				}
				
				// console.log(this.nfcUserStates);
				return null;// this.nfcUserStates;
			},
			(httpErrorResponse: HttpErrorResponse): Observable<string> => {
				return this.onLoadError(httpErrorResponse);
			}
		);
	}
	
	private setUserBackend(userBackend: UserBackendModel | null): void
	{
		this._userBackend = userBackend;
		this.signalUserBackend.set(this._userBackend);
	}*/
}
