import {inject, Injectable} from '@angular/core';
import {BaseService} from './base.service';
import {from, Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {RequestOptionsModel} from '../../shared/models/request-options.model';
import {HttpMethodsEnum} from '../../shared/enums/http-methods.enum';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {InitService} from './init.service';
import {UserCrmFormModel} from '../../shared/models/user-crm-form.model';

@Injectable({
	providedIn: 'root'
})
export class UserCrmService extends BaseService
{
	private initService = inject(InitService);
	
	constructor()
	{
		super();
	}
	
	public async generateToken(data: string): Promise<string>
	{
		const encoder = new TextEncoder();
		const dataBuffer = encoder.encode(data);
		
		const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // hashHex
	}
	
	public getCRMValuesSaveToken(userCrmFormModel: UserCrmFormModel): Observable<{ timestamp: number, token: string } | null>
	{
		const bodyParams: any = {};
		if (this.initService.qz)
		{
			bodyParams.qz = this.initService.qz;
		}
		
		const data: string = JSON.stringify(userCrmFormModel) + '|}-9' + '#cv.';
		
		return from(this.generateToken(data)).pipe(
			switchMap(token => {
				bodyParams.crm = userCrmFormModel;
				bodyParams.token = token;
				
				const url: string = BaseService.getBaseApiUrl() + 'api/user-crm/get-save-token';
				const requestOptions: RequestOptionsModel = new RequestOptionsModel(
					url,
					HttpMethodsEnum.post,
					null,
					null,
					null,
					bodyParams
				);
				
				return this.doHttpRequest<{ timestamp: number, token: string } | null>(
					requestOptions,
					(httpResponse: HttpResponse<any>): { timestamp: number, token: string } | null => {
						const body = httpResponse.body;
						return {
							timestamp: body.timestamp ?? null,
							token: body.token ?? null
						};
					},
					(httpErrorResponse: HttpErrorResponse): Observable<string> => {
						return this.onLoadError(httpErrorResponse);
					}
				);
			}));
	}
	
	public save(
		timestamp: number,
		token: string,
		userCrmFormModel: UserCrmFormModel
	): Observable<any | null>
	{
		const bodyParams: any = {
			timestamp: timestamp,
			token: token,
			crm: userCrmFormModel
		};
		if (this.initService.qz)
		{
			bodyParams.qz = this.initService.qz;
		}
		const url: string = BaseService.getBaseApiUrl() + 'api/user-crm/create';
		const requestOptions: RequestOptionsModel = new RequestOptionsModel(
			url,
			HttpMethodsEnum.post,
			null,
			null,
			null,
			bodyParams
		);
		
		return this.doHttpRequest<any | null>(
			requestOptions,
			(httpResponse: HttpResponse<any>): any | null => {
				if (httpResponse.body.done === true && httpResponse.body.highScore)
				{
					return httpResponse.body;
				}
				
				return null;
			},
			(httpErrorResponse: HttpErrorResponse): Observable<string> => {
				return this.onLoadError(httpErrorResponse);
			}
		);
	}
}
