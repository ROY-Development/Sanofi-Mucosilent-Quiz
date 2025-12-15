import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ShapeSlingshotComponent} from './shape-slingshot.component';

describe('ShapeSlingshotComponent', () => {
	let component: ShapeSlingshotComponent;
	let fixture: ComponentFixture<ShapeSlingshotComponent>;
	
	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [ShapeSlingshotComponent]
		});
		fixture = TestBed.createComponent(ShapeSlingshotComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
