import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ShapeSlingshotModule} from './shape-slingshot/shape-slingshot.module';
import {SwipeYesNoModule} from './swipe-yes-no/swipe-yes-no.module';
import {DialogTaskSolvedComponent} from './dialogs/dialog-task-solved/dialog-task-solved.component';
import {ComponentsModule} from '../core/components/components.module';
import {PipesModule} from '../shared/pipes/pipes.module';
import {DirectivesModule} from '../shared/directives/directives.module';
import {DialogMultiplierSolvedComponent} from './dialogs/dialog-multiplier-solved/dialog-multiplier-solved.component';
import {DialogConfirmComponent} from './dialogs/dialog-confirm/dialog-confirm.component';
import {DialogQuestionsResultComponent} from './dialogs/dialog-questions-result/dialog-questions-result.component';
import {BaseButtonComponent} from '../core/components/buttons/base-button/base-button.component';

@NgModule({
	declarations: [
		DialogTaskSolvedComponent,
		DialogMultiplierSolvedComponent,
		DialogConfirmComponent,
		DialogQuestionsResultComponent
	],
	imports: [
		CommonModule,
		ShapeSlingshotModule,
		SwipeYesNoModule,
		ComponentsModule,
		PipesModule,
		DirectivesModule,
		BaseButtonComponent
	],
	exports: [
		ShapeSlingshotModule,
		SwipeYesNoModule,
		DialogTaskSolvedComponent,
		DialogMultiplierSolvedComponent,
		DialogConfirmComponent,
		DialogQuestionsResultComponent
	]
})
export class GamesModule
{
}
