import {ComponentFixture, TestBed} from '@angular/core/testing';

import {IdlePageComponent} from './idle-page.component';

describe('IdlePageComponent', () => {
	let component: IdlePageComponent;
	let fixture: ComponentFixture<IdlePageComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [IdlePageComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(IdlePageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
