import {TestBed} from '@angular/core/testing';

import {BackgroundShapeService} from './background-shape.service';

describe('BackgroundShapeService', () => {
	let service: BackgroundShapeService;
	
	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(BackgroundShapeService);
	});
	
	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
