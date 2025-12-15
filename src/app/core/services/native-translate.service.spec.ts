import {TestBed} from '@angular/core/testing';

import {NativeTranslateService} from './native-translate.service';

describe('NativeTranslateService', () => {
	let service: NativeTranslateService;
	
	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(NativeTranslateService);
	});
	
	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
