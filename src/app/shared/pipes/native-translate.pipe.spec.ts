import {NativeTranslatePipe} from './native-translate.pipe';
import {getTestBed, TestBed} from '@angular/core/testing';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {NativeTranslateService} from '../../core/services/native-translate.service';
import {ChangeDetectorRef} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

describe('NativeTranslatePipe', () => {
	let injector: TestBed;
	let service: NativeTranslateService;
	let changeDet: ChangeDetectorRef;
	let domSan: DomSanitizer;
	//let httpMock: HttpTestingController;
	beforeEach(() => {
		
		TestBed.configureTestingModule({
			imports: [],
			providers: [
				provideHttpClientTesting() // replaces obsolete HttpClientTestingModule
			]
		});
		
		injector = getTestBed();
		service = injector.inject(NativeTranslateService);
		changeDet = injector.inject(ChangeDetectorRef);
		domSan = injector.inject(DomSanitizer);
		//httpMock = injector.inject(HttpTestingController);
	});
	
	it('create an instance', () => {
		const pipe = new NativeTranslatePipe(service, changeDet, domSan);
		expect(pipe).toBeTruthy();
	});
});
