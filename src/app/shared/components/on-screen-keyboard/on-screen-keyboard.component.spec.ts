import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OnScreenKeyboardComponent} from './on-screen-keyboard.component';

describe('OnscreenKeyboardComponent', () => {
	let component: OnScreenKeyboardComponent;
	let fixture: ComponentFixture<OnScreenKeyboardComponent>;
	
	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [OnScreenKeyboardComponent]
		});
		fixture = TestBed.createComponent(OnScreenKeyboardComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
