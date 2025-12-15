import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AniExplosion} from './ani-explosion.component';

describe('AniExplosion', () => {
	let component: AniExplosion;
	let fixture: ComponentFixture<AniExplosion>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AniExplosion]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(AniExplosion);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
