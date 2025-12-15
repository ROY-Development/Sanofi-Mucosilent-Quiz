import {Component, Input} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
	selector: 'app-gfx-spline',
	templateUrl: './gfx-spline.component.html',
	imports: [
		FormsModule
	],
	standalone: true,
	styleUrl: './gfx-spline.component.scss'
})
export class GfxSplineComponent
{
	@Input({required: true}) public type!: 'quadratic' | 'cubic'; // quadratic Bezier (1 control point) or cubic Bézier (2 control points)
	
	@Input({required: false}) public color: string = '#ff6600';
	@Input({required: false}) public width: number = 100;
	@Input({required: false}) public height: number = 100;
	@Input({required: false}) public startX: number = 0;
	@Input({required: false}) public startY: number = 0;
	@Input({required: false}) public control1X: number = 0;
	@Input({required: false}) public control1Y: number = 67;
	@Input({required: false}) public control2X: number = 100;
	@Input({required: false}) public control2Y: number = 25;
	@Input({required: false}) public endX: number = 100;
	@Input({required: false}) public endY: number = 100;
	@Input({required: false}) public strokeWidth: number = 10;
	@Input({required: false}) public hasControls: boolean = false;
	
	protected get viewBox(): string
	{
		return `0 0 ${this.width + this.strokeWidth} ${this.height + this.strokeWidth}`;
	}
	
	protected get quadraticPathData(): string
	{
		// M 50 250 Q 250 50, 450 250
		return `M ${this.startX * this.width / 100 + this.strokeWidth * 0.5} ${this.startY * this.height / 100 + this.strokeWidth * 0.5}
		Q ${this.control1X * this.width / 100} ${this.control1Y * this.height / 100},
		${this.endX * this.width / 100} ${this.endY * this.height / 100}`;
	}
	
	protected get cubicPathData(): string
	{
		return `M ${this.startX * this.width / 100 + this.strokeWidth * 0.5} ${this.startY * this.height / 100 + this.strokeWidth * 0.5}
		 C ${this.control1X * this.width / 100} ${this.control1Y * this.height / 100},
		 ${this.control2X * this.width / 100} ${this.control2Y * this.height / 100},
		  ${this.endX * this.width / 100} ${this.endY * this.height / 100}`;
	}
}
