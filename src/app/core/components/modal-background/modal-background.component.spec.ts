import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ModalBackgroundComponent} from './modal-background.component';

describe('ModalBackgroundComponent', () => {
	let component: ModalBackgroundComponent;
	let fixture: ComponentFixture<ModalBackgroundComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ModalBackgroundComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(ModalBackgroundComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
