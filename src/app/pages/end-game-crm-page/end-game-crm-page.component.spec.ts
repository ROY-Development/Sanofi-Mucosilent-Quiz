import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EndGameCrmPageComponent} from './end-game-crm-page.component';

describe('EndGameCrmPageComponent', () => {
	let component: EndGameCrmPageComponent;
	let fixture: ComponentFixture<EndGameCrmPageComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [EndGameCrmPageComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(EndGameCrmPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
