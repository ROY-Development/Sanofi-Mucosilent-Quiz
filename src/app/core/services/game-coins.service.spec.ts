import {TestBed} from '@angular/core/testing';

import {GameCoinsService} from './game-coins.service';

describe('GameCoinsService', () => {
	let service: GameCoinsService;
	
	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(GameCoinsService);
	});
	
	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
