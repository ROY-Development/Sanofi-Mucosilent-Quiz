import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DialogTaskSolvedComponent} from './dialog-task-solved.component';

describe('DialogTaskSolvedComponent', () => {
	let component: DialogTaskSolvedComponent;
	let fixture: ComponentFixture<DialogTaskSolvedComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [DialogTaskSolvedComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(DialogTaskSolvedComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
