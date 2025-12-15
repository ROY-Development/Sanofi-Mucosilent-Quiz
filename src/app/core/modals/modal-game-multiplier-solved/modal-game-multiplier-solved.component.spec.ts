import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ModalGameMultiplierSolvedComponent} from './modal-game-multiplier-solved.component';

describe('ModalGameMultiplierSolvedComponent', () => {
	let component: ModalGameMultiplierSolvedComponent;
	let fixture: ComponentFixture<ModalGameMultiplierSolvedComponent>;
	
	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [ModalGameMultiplierSolvedComponent]
		});
		fixture = TestBed.createComponent(ModalGameMultiplierSolvedComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
