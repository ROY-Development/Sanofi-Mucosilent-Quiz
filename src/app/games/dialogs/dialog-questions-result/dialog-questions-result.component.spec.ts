import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DialogQuestionsResultComponent} from './dialog-questions-result.component';

describe('DialogQuestionsResultComponent', () => {
	let component: DialogQuestionsResultComponent;
	let fixture: ComponentFixture<DialogQuestionsResultComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [DialogQuestionsResultComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(DialogQuestionsResultComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
