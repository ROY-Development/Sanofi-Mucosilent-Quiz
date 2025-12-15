import {TestBed} from '@angular/core/testing';

import {AppBackendConfigService} from './app-backend-config.service';

describe('AppBackendConfigService', () => {
	let service: AppBackendConfigService;
	
	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(AppBackendConfigService);
	});
	
	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
