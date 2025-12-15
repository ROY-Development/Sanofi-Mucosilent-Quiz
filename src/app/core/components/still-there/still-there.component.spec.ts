import {ComponentFixture, TestBed} from '@angular/core/testing';

import {StillThereComponent} from './still-there.component';

describe('StillThereComponent', () => {
	let component: StillThereComponent;
	let fixture: ComponentFixture<StillThereComponent>;
	
	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [StillThereComponent]
		});
		fixture = TestBed.createComponent(StillThereComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
