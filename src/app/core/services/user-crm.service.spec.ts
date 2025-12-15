import {TestBed} from '@angular/core/testing';

import {UserCrmService} from './user-crm.service';

describe('UserCrmService', () => {
	let service: UserCrmService;
	
	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(UserCrmService);
	});
	
	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
