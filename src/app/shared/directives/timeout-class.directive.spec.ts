import {TimeoutClassDirective} from './timeout-class.directive';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {DirectivesModule} from './directives.module';
import {By} from '@angular/platform-browser';

@Component({
	imports: [
		DirectivesModule
	],
	template: `
		<div [appTimeoutClass]="'test-class'"></div>`
})
class TestComponent {}

describe('TimeoutClassDirective', () => {
	let fixture: ComponentFixture<TestComponent>;
	let element: HTMLElement;
	
	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [TimeoutClassDirective, TestComponent]
		});
		
		fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();
		element = fixture.debugElement.query(By.directive(TimeoutClassDirective)).nativeElement;
	});
	
	it('should add the animation class after timeout', (done) => {
		setTimeout(() => {
			expect(element.classList).toContain('test-class');
			done();
		}, 1000);
	});
});
