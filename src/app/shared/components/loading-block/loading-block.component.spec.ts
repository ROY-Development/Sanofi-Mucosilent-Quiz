import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {LoadingBlockComponent} from './loading-block.component';

describe('LoadingBlockComponent', () => {
	let component: LoadingBlockComponent;
	let fixture: ComponentFixture<LoadingBlockComponent>;
	
	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [LoadingBlockComponent]
		})
			.compileComponents();
	}));
	
	beforeEach(() => {
		fixture = TestBed.createComponent(LoadingBlockComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
