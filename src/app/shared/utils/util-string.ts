export class UtilString
{
	public static unEscape(htmlStr: string)
	{
		htmlStr = htmlStr.replace(/&lt;/g, "<");
		htmlStr = htmlStr.replace(/&gt;/g, ">");
		htmlStr = htmlStr.replace(/&quot;/g, "\"");
		htmlStr = htmlStr.replace(/&#39;/g, "'");
		htmlStr = htmlStr.replace(/&amp;/g, "&");
		return htmlStr;
	}
	
	public static decodeHtmlCharCodes(str: string): string
	{
		return str.replace(/(&#(\d+);)/g, function(match, capture, charCode) {
			return String.fromCharCode(charCode);
		});
	}
	
	public static getStringFromJson(jsonObj: any, preString: string | null = null): string
	{
		let result: string = '';
		
		let value: any;
		for (const key in jsonObj)
		{
			if (jsonObj.hasOwnProperty(key))
			{
				value = jsonObj[key];
				
				if (typeof value === 'object')
				{
					if (Array.isArray(value))
					{
						value = '<br>' + UtilString.getTableStringByJsonArray(value);
					}
					else
					{
						value = '<br>' + UtilString.getStringFromJson(value, '--- ');
					}
				}
				
				result += preString ? preString : '';
				result += '<strong>' + key + ': </strong>';
				result += '<span class="text-break">' + value + '</span><br>';
			}
		}
		
		return result;
	}
	
	public static getTableStringByJsonArray(jsonList: Array<any>): string
	{
		let result = '';
		
		if (jsonList.length === 0)
		{
			return result;
		}
		
		result = '<div class="scroll-view">';
		result += '<table class="table table-striped text-nowrap"><thead><tr>';
		
		const tableHeadObj = jsonList[0];
		const isIndexedArray: boolean = !!tableHeadObj[0];
		
		if (isIndexedArray)
		{
			result += '<tbody>';
			for (const value of jsonList)
			{
				result += '<tr><td>' + value + '</td></tr>';
			}
		}
		else
		{
			for (const key in tableHeadObj)
			{
				if (tableHeadObj.hasOwnProperty(key))
				{
					result += '<th>' + key + '</th>';
				}
			}
			
			result += '</tr></thead><tbody>';
			for (const obj of jsonList)
			{
				result += '<tr>';
				
				for (const key in obj)
				{
					if (obj.hasOwnProperty(key))
					{
						result += '<td>' + obj[key] + '</td>';
					}
				}
				
				result += '</tr>';
			}
		}
		
		result += '</tbody></table></div>'
		
		return result;
	}
	
	public static copyStringInsideTempMemory(value: string): void
	{
		const el = document.createElement('textarea');
		el.value = value;
		el.setAttribute('readonly', '');
		el.style.position = 'absolute';
		el.style.left = '-9999px';
		document.body.appendChild(el);
		el.select();
		document.execCommand('copy');
		document.body.removeChild(el);
	}
	
	public static getRandomString(length: number): string
	{
		let result: string = '';
		const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength: number = characters.length;
		for (let i = 0; i < length; i++)
		{
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}
	
	public static getBeautifiedStringFromEnumKey(value: any, type: any): string
	{
		if (Array.isArray(value))
		{
			return value.map(v => {
				if (!type[v])
				{
					return '';
				}
				
				let result = type[v].toString().split(/(?=[A-Z])/).join(' ').toLowerCase();
				return result.charAt(0).toUpperCase() + result.slice(1);
			}).join(', ');
		}
		else
		{
			let result = type[value].toString().split(/(?=[A-Z])/).join(' ').toLowerCase();
			return result.charAt(0).toUpperCase() + result.slice(1);
		}
	}
	
	public static addLeadingZeros(num: number, totalDigits: number): string
	{
		let numStr = num.toString();
		while (numStr.length < totalDigits)
		{
			numStr = '0' + numStr;
		}
		return numStr;
	}
}