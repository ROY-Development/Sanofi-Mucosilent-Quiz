import {TestBed} from '@angular/core/testing';

import {IframeEventService} from './iframe-event.service';

describe('IFrameEventService', () => {
	let service: IframeEventService;
	
	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(IframeEventService);
	});
	
	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
