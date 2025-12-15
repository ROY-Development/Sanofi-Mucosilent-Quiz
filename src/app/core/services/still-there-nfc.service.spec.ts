import {TestBed} from '@angular/core/testing';

import {StillThereNfcService} from './still-there-nfc.service';

describe('StillThereNfcService', () => {
	let service: StillThereNfcService;
	
	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(StillThereNfcService);
	});
	
	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
