import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GameFooterComponent} from './game-footer.component';

describe('GameFooterComponent', () => {
	let component: GameFooterComponent;
	let fixture: ComponentFixture<GameFooterComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [GameFooterComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(GameFooterComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
