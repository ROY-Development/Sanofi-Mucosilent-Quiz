import {TestBed} from '@angular/core/testing';

import {GameScoreBackendService} from './game-score-backend.service';

describe('GameScoreBackendService', () => {
	let service: GameScoreBackendService;
	
	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(GameScoreBackendService);
	});
	
	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
