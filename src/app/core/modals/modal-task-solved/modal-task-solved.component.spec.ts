import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ModalTaskSolvedComponent} from './modal-task-solved.component';

describe('ModalTaskSolvedComponent', () => {
	let component: ModalTaskSolvedComponent;
	let fixture: ComponentFixture<ModalTaskSolvedComponent>;
	
	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [ModalTaskSolvedComponent]
		});
		fixture = TestBed.createComponent(ModalTaskSolvedComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
