import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ModalGsNumberExistsComponent} from './modal-gs-number-exists.component';

describe('ModalGsNumberExistsComponent', () => {
	let component: ModalGsNumberExistsComponent;
	let fixture: ComponentFixture<ModalGsNumberExistsComponent>;
	
	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [ModalGsNumberExistsComponent]
		});
		fixture = TestBed.createComponent(ModalGsNumberExistsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
