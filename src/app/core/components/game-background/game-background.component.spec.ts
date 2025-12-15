import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GameBackgroundComponent} from './game-background.component';

describe('GameBackgroundComponent', () => {
	let component: GameBackgroundComponent;
	let fixture: ComponentFixture<GameBackgroundComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [GameBackgroundComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(GameBackgroundComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
