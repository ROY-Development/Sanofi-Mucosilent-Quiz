import {ComponentFixture, TestBed} from '@angular/core/testing';

import {QuestionResultPage} from './question-result-page.component';

describe('QuestionResultPage', () => {
	let component: QuestionResultPage;
	let fixture: ComponentFixture<QuestionResultPage>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [QuestionResultPage]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(QuestionResultPage);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
