import {ComponentFixture, TestBed} from '@angular/core/testing';

import {UserCrmFormComponent} from './user-crm-form.component';

describe('UserCrmFormComponent', () => {
	let component: UserCrmFormComponent;
	let fixture: ComponentFixture<UserCrmFormComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [UserCrmFormComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(UserCrmFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
