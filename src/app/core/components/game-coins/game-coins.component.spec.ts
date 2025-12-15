import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GameCoinsComponent} from './game-coins.component';

describe('GameCoinsComponent', () => {
	let component: GameCoinsComponent;
	let fixture: ComponentFixture<GameCoinsComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [GameCoinsComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(GameCoinsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
