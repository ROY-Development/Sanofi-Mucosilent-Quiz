import {TestBed} from '@angular/core/testing';

import {PointShooterService} from './point-shooter.service';

describe('PointShooterService', () => {
	let service: PointShooterService;
	
	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(PointShooterService);
	});
	
	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
