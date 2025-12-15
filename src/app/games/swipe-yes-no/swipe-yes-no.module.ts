import {NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {SwipeYesNoComponent} from './swipe-yes-no.component';
import {SharedModule} from '../../shared/shared.module';
import {DialogIncorrectComponent} from './dialogs/dialog-incorrect/dialog-incorrect.component';
import {DialogCorrectComponent} from './dialogs/dialog-correct/dialog-correct.component';
import {ComponentsModule} from '../../core/components/components.module';
import {BaseButtonComponent} from '../../core/components/buttons/base-button/base-button.component';

@NgModule({
	declarations: [
		SwipeYesNoComponent,
		DialogIncorrectComponent,
		DialogCorrectComponent
	],
	exports: [
		SwipeYesNoComponent
	],
	imports: [
		CommonModule,
		NgOptimizedImage,
		SharedModule,
		ComponentsModule,
		BaseButtonComponent
	]
})
export class SwipeYesNoModule
{
}
