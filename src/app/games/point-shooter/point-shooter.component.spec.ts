import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PointShooterComponent} from './point-shooter.component';

describe('PointShooterComponent', () => {
	let component: PointShooterComponent;
	let fixture: ComponentFixture<PointShooterComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [PointShooterComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(PointShooterComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
