import {TestBed} from '@angular/core/testing';

import {GameQuestionsService} from './game-questions.service';

describe('GameQuestionsService', () => {
	let service: GameQuestionsService;
	
	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(GameQuestionsService);
	});
	
	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
