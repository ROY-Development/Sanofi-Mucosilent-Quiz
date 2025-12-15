import {Pipe, PipeTransform} from '@angular/core';
import {SafeHtml} from '@angular/platform-browser';

@Pipe({
	name: 'nlToBr',
	standalone: false
})
export class NlToBrPipe implements PipeTransform
{
	public transform(str?: string): SafeHtml
	{
		if (!str)
		{
			return '';
		}
		
		return str.replace(/(\r\n|\r|\n)/g, '<br>');
	}
}
