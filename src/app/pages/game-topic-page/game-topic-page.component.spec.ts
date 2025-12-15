import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GameTopicPageComponent} from './game-topic-page.component';

describe('GameTopicPageComponent', () => {
	let component: GameTopicPageComponent;
	let fixture: ComponentFixture<GameTopicPageComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [GameTopicPageComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(GameTopicPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
