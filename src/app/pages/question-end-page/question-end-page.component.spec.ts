import {ComponentFixture, TestBed} from '@angular/core/testing';

import {QuestionEndPageComponent} from './question-end-page.component';

describe('QuestionEndPageComponent', () => {
	let component: QuestionEndPageComponent;
	let fixture: ComponentFixture<QuestionEndPageComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [QuestionEndPageComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(QuestionEndPageComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
