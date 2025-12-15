import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PachinkoComponent} from './pachinko.component';
import {PipesModule} from '../../shared/pipes/pipes.module';

@NgModule({
	declarations: [
		PachinkoComponent
	],
	exports: [
		PachinkoComponent
	],
	imports: [
		CommonModule,
		PipesModule
	]
})
export class PachinkoModule
{
}
