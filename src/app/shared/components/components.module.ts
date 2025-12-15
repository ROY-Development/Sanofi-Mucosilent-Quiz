import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonFullscreenComponent} from './button-fullscreen/button-fullscreen.component';
import {ButtonSoundOnOffComponent} from './button-sound-on-off/button-sound-on-off.component';
import {InlineConsoleComponent} from './inline-console/inline-console.component';
import {OnScreenKeyboardComponent} from './on-screen-keyboard/on-screen-keyboard.component';
import {LoadingBlockComponent} from './loading-block/loading-block.component';

@NgModule({
	declarations: [
		ButtonFullscreenComponent,
		ButtonSoundOnOffComponent,
		InlineConsoleComponent,
		LoadingBlockComponent,
		OnScreenKeyboardComponent
	],
	exports: [
		ButtonFullscreenComponent,
		ButtonSoundOnOffComponent,
		InlineConsoleComponent,
		LoadingBlockComponent,
		OnScreenKeyboardComponent
	],
	imports: [
		CommonModule
	]
})
export class ComponentsModule
{
}
