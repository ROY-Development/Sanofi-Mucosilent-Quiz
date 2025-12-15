import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NativeTranslatePipe} from './native-translate.pipe';
import {NlToBrPipe} from './nl-to-br.pipe';
import {SafeHtmlPipe} from './safe-html.pipe';
import {TextPluralPipe} from './text-plural.pipe';

@NgModule({
	declarations: [
		NativeTranslatePipe,
		NlToBrPipe,
		SafeHtmlPipe,
		TextPluralPipe
	],
	exports: [
		NativeTranslatePipe,
		NlToBrPipe,
		SafeHtmlPipe,
		TextPluralPipe
	],
	imports: [
		CommonModule
	]
})
export class PipesModule
{
}
