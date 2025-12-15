import {TestBed} from '@angular/core/testing';

import {BackgroundGradientService} from './background-gradient.service';

describe('BackgroundGradientService', () => {
	let service: BackgroundGradientService;
	
	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(BackgroundGradientService);
	});
	
	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
