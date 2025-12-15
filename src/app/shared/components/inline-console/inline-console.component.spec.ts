import {ComponentFixture, TestBed} from '@angular/core/testing';

import {InlineConsoleComponent} from './inline-console.component';

describe('InlineConsoleComponent', () => {
	let component: InlineConsoleComponent;
	let fixture: ComponentFixture<InlineConsoleComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [InlineConsoleComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(InlineConsoleComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
