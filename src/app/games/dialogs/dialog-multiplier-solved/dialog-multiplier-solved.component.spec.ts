import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DialogMultiplierSolvedComponent} from './dialog-multiplier-solved.component';

describe('DialogMultiplierSolvedComponent', () => {
	let component: DialogMultiplierSolvedComponent;
	let fixture: ComponentFixture<DialogMultiplierSolvedComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [DialogMultiplierSolvedComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(DialogMultiplierSolvedComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
