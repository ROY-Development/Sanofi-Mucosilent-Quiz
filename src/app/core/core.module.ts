import {NgModule} from '@angular/core';
import {ComponentsModule} from './components/components.module';
import {ModalsModule} from './modals/modals.module';

@NgModule({
	declarations: [],
	exports: [
		ComponentsModule,
		ModalsModule
	],
	imports: [
		ComponentsModule,
		ModalsModule
	]
})
export class CoreModule
{
}
