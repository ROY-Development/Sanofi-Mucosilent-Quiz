import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonFullscreenComponent} from './button-fullscreen/button-fullscreen.component';
import {ButtonSoundOnOffComponent} from './button-sound-on-off/button-sound-on-off.component';
import {InlineConsoleComponent} from './inline-console/inline-console.component';
import {OnScreenKeyboardComponent} from './on-screen-keyboard/on-screen-keyboard.component';
import {LoadingBlockComponent} from './loading-block/loading-block.component';
import {ScratchFreeComponent} from './scratch-free/scratch-free.component';
import {AniExplosionComponent} from './ani-explosion/ani-explosion.component';

@NgModule({
	declarations: [
		ButtonFullscreenComponent,
		ButtonSoundOnOffComponent,
		InlineConsoleComponent,
		LoadingBlockComponent,
		OnScreenKeyboardComponent,
		ScratchFreeComponent,
		AniExplosionComponent
	],
	exports: [
		ButtonFullscreenComponent,
		ButtonSoundOnOffComponent,
		InlineConsoleComponent,
		LoadingBlockComponent,
		OnScreenKeyboardComponent,
		ScratchFreeComponent,
		AniExplosionComponent
	],
	imports: [
		CommonModule
	]
})
export class ComponentsModule
{
}
