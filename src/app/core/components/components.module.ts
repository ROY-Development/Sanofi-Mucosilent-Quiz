import {NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../shared/shared.module';
import {GameBackgroundComponent} from './game-background/game-background.component';
import {GameCoinsComponent} from './game-coins/game-coins.component';
import {GameHeaderComponent} from './game-header/game-header.component';
import {GameTitleComponent} from './game-title/game-title.component';
import {ModalBackgroundComponent} from './modal-background/modal-background.component';
import {ScreenPartComponent} from './screen-part/screen-part.component';
import {StillThereComponent} from './still-there/still-there.component';
import {GameCategoryCardComponent} from './game-category-card/game-category-card.component';
import {BaseButtonComponent} from './buttons/base-button/base-button.component';
import {GameFooterComponent} from './game-footer/game-footer.component';

@NgModule({
	declarations: [
		GameBackgroundComponent,
		GameCoinsComponent,
		GameHeaderComponent,
		GameTitleComponent,
		ModalBackgroundComponent,
		ScreenPartComponent,
		StillThereComponent,
		GameCategoryCardComponent,
		GameFooterComponent
	],
	exports: [
		GameBackgroundComponent,
		GameCoinsComponent,
		GameHeaderComponent,
		GameTitleComponent,
		ModalBackgroundComponent,
		ScreenPartComponent,
		StillThereComponent,
		GameCategoryCardComponent,
		GameFooterComponent
	],
	imports: [
		CommonModule,
		NgOptimizedImage,
		SharedModule,
		ReactiveFormsModule,
		BaseButtonComponent
	]
})
export class ComponentsModule
{
}
