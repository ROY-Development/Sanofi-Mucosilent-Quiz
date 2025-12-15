import {TestBed} from '@angular/core/testing';

import {AniSplitScreenTitleService} from './ani-split-screen-title.service';

describe('AniSplitScreenTitleService', () => {
	let service: AniSplitScreenTitleService;
	
	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(AniSplitScreenTitleService);
	});
	
	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
