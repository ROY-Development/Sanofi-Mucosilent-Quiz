import {SafeHtmlPipe} from './safe-html.pipe';
import {BrowserModule, DomSanitizer} from '@angular/platform-browser';
import {inject, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {provideHttpClientTesting} from '@angular/common/http/testing';

describe('SafeHtmlPipe', () => {
	beforeEach((() => {
		TestBed.configureTestingModule({
			imports: [
				BrowserModule
			],
			declarations: [],
			providers: [
				DomSanitizer,
				provideHttpClientTesting() // replaces obsolete HttpClientTestingModule
			],
			schemas: [NO_ERRORS_SCHEMA]
		})
			.compileComponents();
	}));
	
	it('create an instance', inject([DomSanitizer], (domSanitizer: DomSanitizer) => {
		const pipe = new SafeHtmlPipe(domSanitizer);
		expect(pipe).toBeTruthy();
	}));
});
