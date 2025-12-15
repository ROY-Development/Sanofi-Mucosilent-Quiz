import {TestBed} from '@angular/core/testing';

import {SwipeYesNoService} from './swipe-yes-no.service';

describe('SwipeYesNoService', () => {
	let service: SwipeYesNoService;
	
	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(SwipeYesNoService);
	});
	
	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
