import {ComponentFixture, TestBed} from '@angular/core/testing';

import {HowToPlayPageComponent} from './how-to-play-page.component';

describe('HowToPlayPageComponent', () => {
	let component: HowToPlayPageComponent;
	let fixture: ComponentFixture<HowToPlayPageComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [HowToPlayPageComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(HowToPlayPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
