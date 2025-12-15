import {TestBed} from '@angular/core/testing';

import {ScormService} from './scorm.service';

describe('ScormService', () => {
	let service: ScormService;
	
	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ScormService);
	});
	
	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
