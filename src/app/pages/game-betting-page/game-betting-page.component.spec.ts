import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GameBettingPageComponent} from './game-betting-page.component';

describe('GameBettingPageComponent', () => {
	let component: GameBettingPageComponent;
	let fixture: ComponentFixture<GameBettingPageComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [GameBettingPageComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(GameBettingPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
