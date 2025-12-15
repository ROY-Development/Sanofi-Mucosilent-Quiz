import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PointShooterComponent} from './point-shooter.component';
import {PipesModule} from '../../shared/pipes/pipes.module';

@NgModule({
	declarations: [
		PointShooterComponent
	],
	exports: [
		PointShooterComponent
	],
	imports: [
		CommonModule,
		PipesModule
	]
})
export class PointShooterModule
{
}
