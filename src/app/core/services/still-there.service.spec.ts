import {TestBed} from '@angular/core/testing';

import {StillThereService} from './still-there.service';

describe('StillThereService', () => {
	let service: StillThereService;
	
	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(StillThereService);
	});
	
	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
