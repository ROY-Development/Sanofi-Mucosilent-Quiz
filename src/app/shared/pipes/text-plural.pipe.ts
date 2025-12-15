import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
	name: 'textPlural',
	standalone: false
})
export class TextPluralPipe implements PipeTransform
{
	public transform(amount: number, textSingular: string, textPlural: string): string
	{
		return amount === 1 ? textSingular : textPlural;
	}
	
}
