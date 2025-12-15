import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ScreenPartComponent} from './screen-part.component';

describe('ScreenPartComponent', () => {
	let component: ScreenPartComponent;
	let fixture: ComponentFixture<ScreenPartComponent>;
	
	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [ScreenPartComponent]
		});
		fixture = TestBed.createComponent(ScreenPartComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
