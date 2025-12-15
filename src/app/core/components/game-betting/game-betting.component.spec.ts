import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GameBettingComponent} from './game-betting.component';

describe('GameBettingComponent', () => {
	let component: GameBettingComponent;
	let fixture: ComponentFixture<GameBettingComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [GameBettingComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(GameBettingComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
