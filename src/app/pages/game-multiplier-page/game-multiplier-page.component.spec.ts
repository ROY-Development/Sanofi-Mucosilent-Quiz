import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GameMultiplierPageComponent} from './game-multiplier-page.component';

describe('GameMultiplierPageComponent', () => {
	let component: GameMultiplierPageComponent;
	let fixture: ComponentFixture<GameMultiplierPageComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [GameMultiplierPageComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(GameMultiplierPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
