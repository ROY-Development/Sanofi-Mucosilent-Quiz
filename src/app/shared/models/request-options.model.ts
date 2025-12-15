import {HttpMethodsEnum} from '../enums/http-methods.enum';
import {UtilObj} from '../utils/util-obj';

export class RequestOptionsModel
{
	constructor(
		public url: string,
		public httpMethod: HttpMethodsEnum,
		public pathParams: any = {},
		public queryParams: any = {},
		public headerParams: any = {},
		public bodyParams: any = {},
		public urlFileExtension: string = '.php'
	)
	{
	}
	
	public getUrl(): string
	{
		let url: string = this.getPathParamsUrl(this.url) + this.urlFileExtension;
		url = this.getQueryParamsUrl(url);
		
		/*if (window.location.host === 'webcache.googleusercontent.com')
		{
			url = url.replace('webcache.googleusercontent.com', 'www.dpu.de');
		}*/
		
		return url;
	}
	
	protected getPathParamsUrl(url: string): string
	{
		let urlToReturn: string = url
			.replace(new RegExp('{{', 'g'), '{')
			.replace(new RegExp('}}', 'g'), '}');
		
		if (this.pathParams)
		{
			for (const key in this.pathParams)
			{
				if (this.pathParams.hasOwnProperty(key) && this.pathParams[key])
				{
					const value: string = this.pathParams[key];
					const searchStr: string = '{' + key + '}';
					
					if (urlToReturn.indexOf(searchStr) !== -1)
					{
						urlToReturn = urlToReturn.replace(searchStr, value);
					}
				}
			}
		}
		
		if (urlToReturn.indexOf('{') !== -1 && urlToReturn.indexOf('}') !== -1)
		{
			urlToReturn = urlToReturn.split('/{')[0];
		}
		
		return urlToReturn;
	}
	
	protected getQueryParamsUrl(url: string = ''): string
	{
		if (this.queryParams)
		{
			const requestList: Array<string> = [];
			
			for (const key in this.queryParams)
			{
				if (this.queryParams.hasOwnProperty(key))
				{
					const value: any = this.queryParams[key];
					
					if (Array.isArray(value))
					{
						for (const obj of value)
						{
							requestList.push(key + '[]=' + obj.toString());
						}
					}
					else if (value || UtilObj.isset(value))
					{
						requestList.push(key + '=' + value.toString());
					}
				}
			}
			
			if (requestList.length > 0)
			{
				url += '?' + requestList.join('&');
			}
		}
		
		return url;
	}
}
