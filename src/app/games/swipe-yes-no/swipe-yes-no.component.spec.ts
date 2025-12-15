import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SwipeYesNoComponent} from './swipe-yes-no.component';

describe('SwipeYesNoComponent', () => {
	let component: SwipeYesNoComponent;
	let fixture: ComponentFixture<SwipeYesNoComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [SwipeYesNoComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(SwipeYesNoComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
