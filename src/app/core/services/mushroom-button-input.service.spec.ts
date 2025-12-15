import {TestBed} from '@angular/core/testing';

import {MushroomButtonInputService} from './mushroom-button-input.service';

describe('MushroomButtonInputService', () => {
	let service: MushroomButtonInputService;
	
	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(MushroomButtonInputService);
	});
	
	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
