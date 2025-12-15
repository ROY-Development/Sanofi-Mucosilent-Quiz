import {HoverClassDirective} from './hover-class.directive';
import {ElementRef} from '@angular/core';

describe('HoverClassDirective', () => {
	it('should create an instance', () => {
		const directive = new HoverClassDirective(<ElementRef>{});
		expect(directive).toBeTruthy();
	});
});
