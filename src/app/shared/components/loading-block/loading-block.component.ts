import {Component, Input} from '@angular/core';

@Component({
	selector: 'app-loading-block',
	templateUrl: './loading-block.component.html',
	styleUrls: ['./loading-block.component.scss'],
	standalone: false
})
export class LoadingBlockComponent
{
	@Input() public isFullScreen: boolean = true;
	@Input() public currentStep: number = 0;
	@Input() public maxSteps: number = 0;
	@Input() public id: string | null = null;
}
