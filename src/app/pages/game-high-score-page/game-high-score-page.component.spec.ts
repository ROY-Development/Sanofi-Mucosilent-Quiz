import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GameHighScorePageComponent} from './game-high-score-page.component';

describe('GameHighScorePageComponent', () => {
	let component: GameHighScorePageComponent;
	let fixture: ComponentFixture<GameHighScorePageComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [GameHighScorePageComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(GameHighScorePageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
