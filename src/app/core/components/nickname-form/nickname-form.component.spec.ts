import {ComponentFixture, TestBed} from '@angular/core/testing';

import {NicknameFormComponent} from './nickname-form.component';

describe('NicknameFormComponent', () => {
	let component: NicknameFormComponent;
	let fixture: ComponentFixture<NicknameFormComponent>;
	
	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [NicknameFormComponent]
		});
		fixture = TestBed.createComponent(NicknameFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
