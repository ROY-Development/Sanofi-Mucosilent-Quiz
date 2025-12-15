import {TestBed} from '@angular/core/testing';

import {IframeEventRuleService} from './iframe-event-rule.service';

describe('IframeEventRuleService', () => {
	let service: IframeEventRuleService;
	
	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(IframeEventRuleService);
	});
	
	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
