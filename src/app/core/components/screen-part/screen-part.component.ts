import {Component, Input, TemplateRef} from '@angular/core';
import {ScreenPartSideEnum} from '../../../shared/enums/screen-part-side.enum';

@Component({
	selector: 'app-screen-part',
	templateUrl: './screen-part.component.html',
	styleUrls: ['./screen-part.component.scss'],
	standalone: false
})
/*
 usage:
 <ng-template #screenPart let-value="value">
	<div class="screen-part-container">
		{{value}}
	</div>
</ng-template>

<app-screen-part [screenPartSide]="screenPartSideEnum.topLeft"
				 [template]="screenPart"
				 [context]="{value: 1}"
				 [zIndex]="10"
></app-screen-part>
 */
export class ScreenPartComponent
{
	@Input({required: true}) public screenPartSide: ScreenPartSideEnum = ScreenPartSideEnum.bottom;
	@Input({required: true}) public template?: TemplateRef<any>;
	@Input({required: false}) public context: any;
	@Input({required: false}) public zIndex: number | null = null;
	@Input() public width: string = 'auto';
	@Input() public height: string = 'auto';
}
