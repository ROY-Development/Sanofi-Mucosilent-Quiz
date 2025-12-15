export class UtilHttp
{
	public static isLocalHost(): boolean
	{
		if (!window.location || !window.location.hostname)
		{
			return false;
		}
		
		const locationHostName: string = window.location.hostname;
		
		return locationHostName === 'localhost' ||
			locationHostName === '127.0.0.1' ||
			locationHostName.substring(0, 8) === '192.168.' ||
			locationHostName.substring(0, 7) === '172.16.';
	}
	
	public static getQueryParams(): object
	{
		const queryIndex: number = window.location.hash.indexOf('?');
		
		if (queryIndex !== -1)
		{
			const hash = window.location.hash.substring(queryIndex + 1);
			const params: any = {};
			hash.split('&').map(hk => {
				const temp = hk.split('=');
				params[temp[0]] = temp[1];
			});
			
			return params;
		}
		
		return {};
	}
	
	public static getUrlWithData(url: string = '', serializedData: string = ''): string
	{
		let urlWithData: string = '';
		
		if (url.length > 0)
		{
			urlWithData = url;
			
			if (serializedData.length > 0)
			{
				urlWithData += '?data=' + serializedData;
			}
		}
		
		return urlWithData;
	}
	
	public static openUrlWithData(url: string = '', serializedData: string = ''): boolean
	{
		const urlWithData: string = UtilHttp.getUrlWithData(url, serializedData);
		
		if (urlWithData.length > 0)
		{
			window.open(urlWithData, '_self');
			
			return true;
		}
		
		return false;
	}
	
	public static clearAllRadioButtons(elementName: string): void
	{
		const radList = document.getElementsByName(elementName);
		// eslint-disable-next-line @typescript-eslint/prefer-for-of
		for (let i = 0; i < radList.length; i++)
		{
			// @ts-ignore
			if (radList[i].checked)
			{
				const radioButton = document.getElementById(radList[i].id);
				if (radioButton)
				{
					(<HTMLInputElement>radioButton).checked = false;
				}
			}
		}
	}
	
	public static encodeUrlFully(url: string): string
	{
		return encodeURIComponent(url.toLowerCase()
			.replace(/\(/g, '%28')
			.replace(/\)/g, '%29'));
	}
	
	public static decodeUrlFully(url: string): string
	{
		return decodeURIComponent(url);
	}
	
	public static createDownload(url: string, filename: string, onComplete: any = null): void
	{
		fetch(url)
			.then(resp => resp.blob())
			.then(blob => {
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.style.display = 'none';
				a.href = url;
				a.download = filename; // the filename you want
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				
				if (onComplete)
				{
					onComplete();
				}
			})
			.catch(() => {
				if (onComplete)
				{
					onComplete();
				}
			});
	}
}
