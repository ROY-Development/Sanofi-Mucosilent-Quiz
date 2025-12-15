import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DialogCorrectComponent} from './dialog-correct.component';

describe('DialogCorrectComponent', () => {
	let component: DialogCorrectComponent;
	let fixture: ComponentFixture<DialogCorrectComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [DialogCorrectComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(DialogCorrectComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
