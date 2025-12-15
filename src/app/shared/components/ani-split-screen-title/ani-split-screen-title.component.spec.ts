import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AniSplitScreenTitleComponent} from './ani-split-screen-title.component';

describe('AniSplitScreenTitleComponent', () => {
	let component: AniSplitScreenTitleComponent;
	let fixture: ComponentFixture<AniSplitScreenTitleComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AniSplitScreenTitleComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(AniSplitScreenTitleComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
