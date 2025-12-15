import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouletteComponent} from './roulette.component';
import {PipesModule} from '../../shared/pipes/pipes.module';

@NgModule({
	declarations: [
		RouletteComponent
	],
	exports: [
		RouletteComponent
	],
	imports: [
		CommonModule,
		PipesModule
	]
})
export class RouletteModule
{
}
