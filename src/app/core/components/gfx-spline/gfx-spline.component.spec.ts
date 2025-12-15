import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GfxSplineComponent} from './gfx-spline.component';

describe('GfxSplineComponent', () => {
	let component: GfxSplineComponent;
	let fixture: ComponentFixture<GfxSplineComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [GfxSplineComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(GfxSplineComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
