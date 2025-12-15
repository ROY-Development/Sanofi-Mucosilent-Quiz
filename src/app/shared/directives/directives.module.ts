import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AutoFitFontDirective} from './auto-fit-font.directive';
import {AutofocusDirective} from './autofocus.directive';
import {DownClassDirective} from './down-class.directive';
import {HoverClassDirective} from './hover-class.directive';
import {TimeoutClassDirective} from './timeout-class.directive';

@NgModule({
	declarations: [
		AutoFitFontDirective,
		AutofocusDirective,
		DownClassDirective,
		HoverClassDirective,
		TimeoutClassDirective
	],
	imports: [
		CommonModule
	],
	exports: [
		AutoFitFontDirective,
		AutofocusDirective,
		DownClassDirective,
		HoverClassDirective,
		TimeoutClassDirective
	]
})
export class DirectivesModule
{
}
