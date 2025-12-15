import {Injectable, signal} from '@angular/core';
import {BaseService} from './base.service';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {RequestOptionsModel} from '../../shared/models/request-options.model';
import {HttpMethodsEnum} from '../../shared/enums/http-methods.enum';
import {AppBackendConfigModel} from '../../shared/models/app-backend-config.model';

@Injectable({
	providedIn: 'root'
})
export class AppBackendConfigService extends BaseService
{
	public appBackendConfig: AppBackendConfigModel | null = null;
	public readonly signalAppBackendConfig = signal<AppBackendConfigModel | null>(null);
	
	public get(): Observable<AppBackendConfigModel | null>
	{
		const url: string = BaseService.getBaseApiUrl() + 'api/app-config/get';
		const requestOptions: RequestOptionsModel = new RequestOptionsModel(
			url,
			HttpMethodsEnum.get,
			null,
			null,
			null,
			null
		);
		
		return this.doHttpRequest<AppBackendConfigModel | null>(
			requestOptions,
			(httpResponse: HttpResponse<any>): AppBackendConfigModel | null => {
				if (httpResponse.body.config)
				{
					this.setAppBackendConfig(AppBackendConfigModel.getModelFromJson(httpResponse.body.config));
				}
				
				return this.appBackendConfig;
			},
			(httpErrorResponse: HttpErrorResponse): Observable<string> => {
				
				return this.onLoadError(httpErrorResponse);
			}
		);
	}
	
	public update(mushroomButtons: Array<{ gamepadId: string, buttonIndex: number }>): Observable<boolean>
	{
		const url: string = BaseService.getBaseApiUrl() + 'api/app-config/update';
		const mushroomButtonsRequest: Array<any> = [];
		
		for (const value of mushroomButtons)
		{
			mushroomButtonsRequest.push({gamepadId: value.gamepadId, buttonIndex: value.buttonIndex});
		}
		
		const requestOptions: RequestOptionsModel = new RequestOptionsModel(
			url,
			HttpMethodsEnum.post,
			{},
			{},
			{},
			{
				mushroomButtons: mushroomButtonsRequest
			}
		);
		
		return this.doHttpRequest<boolean>(
			requestOptions,
			(httpResponse: HttpResponse<any>): boolean | null => {
				return httpResponse.body.done ?? false;
			},
			(httpErrorResponse: HttpErrorResponse): Observable<string> => {
				return this.onLoadError(httpErrorResponse);
			},
			null,
			null,
			false
		);
	}
	
	public setAppBackendConfig(appBackendConfig: AppBackendConfigModel | null): void
	{
		this.appBackendConfig = appBackendConfig;
		this.signalAppBackendConfig.set(this.appBackendConfig);
		console.log(this.appBackendConfig);
	}
}
