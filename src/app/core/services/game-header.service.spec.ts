import {TestBed} from '@angular/core/testing';

import {GameHeaderService} from './game-header.service';

describe('GameHeaderService', () => {
	let service: GameHeaderService;
	
	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(GameHeaderService);
	});
	
	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
