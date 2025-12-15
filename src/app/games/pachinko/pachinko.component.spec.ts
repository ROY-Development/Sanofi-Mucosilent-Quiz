import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PachinkoComponent} from './pachinko.component';

describe('PachinkoComponent', () => {
	let component: PachinkoComponent;
	let fixture: ComponentFixture<PachinkoComponent>;
	
	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [PachinkoComponent]
		});
		fixture = TestBed.createComponent(PachinkoComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
