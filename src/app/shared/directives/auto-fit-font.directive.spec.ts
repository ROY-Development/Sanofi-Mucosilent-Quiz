import {AutoFitFontDirective} from './auto-fit-font.directive';
import {ElementRef, Renderer2} from '@angular/core';

describe('AutoFitFontDirective', () => {
	it('should create an instance', () => {
		const directive = new AutoFitFontDirective(<ElementRef>{}, <Renderer2>{});
		expect(directive).toBeTruthy();
	});
});
