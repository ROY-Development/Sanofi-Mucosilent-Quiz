import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ModalConfirmComponent} from './modal-confirm/modal-confirm.component';
import {ModalTaskSolvedComponent} from './modal-task-solved/modal-task-solved.component';
import {PipesModule} from '../../shared/pipes/pipes.module';
import {
	ModalGameMultiplierSolvedComponent
} from './modal-game-multiplier-solved/modal-game-multiplier-solved.component';
import {ModalGsNumberExistsComponent} from './modal-gs-number-exists/modal-gs-number-exists.component';
import {ComponentsModule} from '../components/components.module';
import {DirectivesModule} from '../../shared/directives/directives.module';

@NgModule({
	declarations: [
		ModalConfirmComponent,
		ModalTaskSolvedComponent,
		ModalGameMultiplierSolvedComponent,
		ModalGsNumberExistsComponent
	],
	imports: [
		CommonModule,
		PipesModule,
		ComponentsModule,
		DirectivesModule
	]
})
export class ModalsModule
{
}
