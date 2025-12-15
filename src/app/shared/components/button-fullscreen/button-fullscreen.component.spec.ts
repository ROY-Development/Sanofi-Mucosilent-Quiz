import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ButtonFullscreenComponent} from './button-fullscreen.component';

describe('ButtonFullscreenComponent', () => {
	let component: ButtonFullscreenComponent;
	let fixture: ComponentFixture<ButtonFullscreenComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ButtonFullscreenComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(ButtonFullscreenComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
