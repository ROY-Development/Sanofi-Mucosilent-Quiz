import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DialogIncorrectComponent} from './dialog-incorrect.component';

describe('DialogIncorrectComponent', () => {
	let component: DialogIncorrectComponent;
	let fixture: ComponentFixture<DialogIncorrectComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [DialogIncorrectComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(DialogIncorrectComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
