import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ShapeSlingshotComponent} from './shape-slingshot.component';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
	declarations: [
		ShapeSlingshotComponent
	],
	exports: [
		ShapeSlingshotComponent
	],
	imports: [
		CommonModule,
		SharedModule
	]
})
export class ShapeSlingshotModule
{
}
