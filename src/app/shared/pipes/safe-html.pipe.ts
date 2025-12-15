import {inject, Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Pipe({
	name: 'safeHtml',
	standalone: false
})
export class SafeHtmlPipe implements PipeTransform
{
	private sanitizer = inject(DomSanitizer);
	
	public transform(html?: string): SafeHtml
	{
		if (!html)
		{
			return '';
		}
		
		return this.sanitizer.bypassSecurityTrustHtml(html);
	}
}