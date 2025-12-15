import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ScratchFreeComponent} from './scratch-free.component';

describe('OnScreenKeyboardComponent', () => {
	let component: ScratchFreeComponent;
	let fixture: ComponentFixture<ScratchFreeComponent>;
	
	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [ScratchFreeComponent]
		});
		fixture = TestBed.createComponent(ScratchFreeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});