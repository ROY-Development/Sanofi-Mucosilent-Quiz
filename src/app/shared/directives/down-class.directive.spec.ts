import {DownClassDirective} from './down-class.directive';
import {ElementRef} from '@angular/core';

describe('DownClassDirective', () => {
	it('should create an instance', () => {
		const directive = new DownClassDirective(<ElementRef>{});
		expect(directive).toBeTruthy();
	});
});
