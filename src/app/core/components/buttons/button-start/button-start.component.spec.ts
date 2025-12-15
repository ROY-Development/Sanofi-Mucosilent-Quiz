import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ButtonStartComponent} from './button-start.component';

describe('ButtonStartComponent', () => {
	let component: ButtonStartComponent;
	let fixture: ComponentFixture<ButtonStartComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ButtonStartComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(ButtonStartComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
