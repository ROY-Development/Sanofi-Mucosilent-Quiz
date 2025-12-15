import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GameCategoryCardComponent} from './game-category-card.component';

describe('GameCategoryCardComponent', () => {
	let component: GameCategoryCardComponent;
	let fixture: ComponentFixture<GameCategoryCardComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [GameCategoryCardComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(GameCategoryCardComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
