import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {BaseService} from './base.service';

describe('BaseService', () => {
	
	let injector: TestBed;
	let service: BaseService;
	let httpMock: HttpTestingController;
	beforeEach(() => {
		
		TestBed.configureTestingModule({
			imports: [],
			providers: [
				BaseService,
				provideHttpClientTesting() // replaces obsolete HttpClientTestingModule
			]
		});
		
		injector = getTestBed();
		service = injector.inject(BaseService);
		httpMock = injector.inject(HttpTestingController);
	});
	
	it('should create', () => {
		expect(service).toBeTruthy();
	});
});