import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {PipesModule} from './pipes/pipes.module';
import {ComponentsModule} from './components/components.module';
import {DirectivesModule} from './directives/directives.module';
import {ModulesModule} from './modules/modules.module';

@NgModule({
	declarations: [],
	imports: [
		CommonModule,
		RouterOutlet,
		ComponentsModule,
		DirectivesModule,
		ModulesModule,
		PipesModule
	],
	exports: [
		ComponentsModule,
		DirectivesModule,
		ModulesModule,
		PipesModule
	]
})
export class SharedModule
{
}
