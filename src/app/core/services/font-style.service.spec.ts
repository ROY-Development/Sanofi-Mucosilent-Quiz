import {TestBed} from '@angular/core/testing';

import {FontStyleService} from './font-style.service';

describe('FontStyleService', () => {
	let service: FontStyleService;
	
	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(FontStyleService);
	});
	
	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
