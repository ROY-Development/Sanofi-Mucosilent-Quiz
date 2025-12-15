import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ButtonSoundOnOffComponent} from './button-sound-on-off.component';

describe('ButtonSoundOnOffComponent', () => {
	let component: ButtonSoundOnOffComponent;
	let fixture: ComponentFixture<ButtonSoundOnOffComponent>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ButtonSoundOnOffComponent]
		})
			.compileComponents();
		
		fixture = TestBed.createComponent(ButtonSoundOnOffComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});
	
	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
