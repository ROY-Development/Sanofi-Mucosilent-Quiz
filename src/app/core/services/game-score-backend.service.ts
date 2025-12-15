import {inject, Injectable} from '@angular/core';
import {BaseService} from './base.service';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {from, Observable, of} from 'rxjs';
import {RequestOptionsModel} from '../../shared/models/request-options.model';
import {HttpMethodsEnum} from '../../shared/enums/http-methods.enum';
import {GameScoreModel} from '../../shared/models/game-score.model';
import {GameScoreService} from './game-score.service';
import {HighscoreTimespanEnum} from '../../shared/enums/highscore-timespan.enum';
import {InitService} from './init.service';
import {switchMap} from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class GameScoreBackendService extends BaseService
{
	private initService = inject(InitService);
	
	constructor()
	{
		super();
	}
	
	public getHighScore(timespan: HighscoreTimespanEnum = HighscoreTimespanEnum.allTime): Observable<Array<GameScoreModel> | null>
	{
		if (this.initService.isScormPackage)
		{
			return of(null);
		}
		
		const queryParams: any = {};
		if (this.initService.qz)
		{
			queryParams.qz = this.initService.qz;
		}
		if (timespan !== HighscoreTimespanEnum.allTime)
		{
			queryParams.timespan = timespan;
		}
		const url: string = BaseService.getBaseApiUrl() + 'api/high-score/get';
		const requestOptions: RequestOptionsModel = new RequestOptionsModel(
			url,
			HttpMethodsEnum.get,
			null,
			queryParams,
			null,
			null
		);
		
		return this.doHttpRequest<Array<GameScoreModel> | null>(
			requestOptions,
			(httpResponse: HttpResponse<any>): Array<GameScoreModel> | null => {
				if (
					httpResponse.body.done === true &&
					httpResponse.body.highScore &&
					Array.isArray(httpResponse.body.highScore)
				)
				{
					const result = GameScoreModel.getListFromJSON(httpResponse.body.highScore);
					
					// extend min entries
					for (let i = result.length, n = GameScoreService.maxGameHighScoreCount; i < n; ++i)
					{
						result.push(new GameScoreModel('', 0, 0, ''));
					}
					
					return result;
				}
				
				return null;
			},
			(httpErrorResponse: HttpErrorResponse): Observable<string> => {
				return this.onLoadError(httpErrorResponse);
			}
		);
	}
	
	public async generateToken(data: string): Promise<string>
	{
		const encoder = new TextEncoder();
		const dataBuffer = encoder.encode(data);
		
		const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // hashHex
	}
	
	public getHighScoreSaveToken(score: number, correctRate: number): Observable<{ timestamp: number, token: string } | null>
	{
		const bodyParams: any = {};
		if (this.initService.qz)
		{
			bodyParams.qz = this.initService.qz;
		}
		
		const data: string = score.toString() + correctRate.toString() + '|#--0' + '{er.';
		return from(this.generateToken(data)).pipe(
			switchMap(token => {
				bodyParams.score = score;
				bodyParams.correctRate = correctRate;
				bodyParams.token = token;
				
				const url: string = BaseService.getBaseApiUrl() + 'api/high-score/get-save-token';
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
	
	public addHighScore(
		timestamp: number,
		token: string,
		nickname: string,
		score: number,
		correctRate: number
	): Observable<any | null>
	{
		const bodyParams: any = {
			timestamp: timestamp,
			token: token,
			nickname: nickname,
			score: score,
			correctRate: correctRate
		};
		if (this.initService.qz)
		{
			bodyParams.qz = this.initService.qz;
		}
		const url: string = BaseService.getBaseApiUrl() + 'api/high-score/create';
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
