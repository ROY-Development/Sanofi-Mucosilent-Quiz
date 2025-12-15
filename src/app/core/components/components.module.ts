import {NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../shared/shared.module';
import {GameBackgroundComponent} from './game-background/game-background.component';
import {GameBettingComponent} from './game-betting/game-betting.component';
import {GameCoinsComponent} from './game-coins/game-coins.component';
import {GameHeaderComponent} from './game-header/game-header.component';
import {GameScoreTableComponent} from './game-score-table/game-score-table.component';
import {GameTitleComponent} from './game-title/game-title.component';
import {ModalBackgroundComponent} from './modal-background/modal-background.component';
import {NicknameFormComponent} from './nickname-form/nickname-form.component';
import {ScreenPartComponent} from './screen-part/screen-part.component';
import {StillThereComponent} from './still-there/still-there.component';
import {GameCategoryCardComponent} from './game-category-card/game-category-card.component';
import {UserCrmFormComponent} from './crm-form/user-crm-form.component';
import {BaseButtonComponent} from './buttons/base-button/base-button.component';

@NgModule({
	declarations: [
		GameBackgroundComponent,
		GameBettingComponent,
		GameCoinsComponent,
		GameHeaderComponent,
		GameScoreTableComponent,
		GameTitleComponent,
		ModalBackgroundComponent,
		NicknameFormComponent,
		ScreenPartComponent,
		StillThereComponent,
		GameCategoryCardComponent,
		UserCrmFormComponent
	],
	exports: [
		GameBackgroundComponent,
		GameBettingComponent,
		GameCoinsComponent,
		GameHeaderComponent,
		GameScoreTableComponent,
		GameTitleComponent,
		ModalBackgroundComponent,
		NicknameFormComponent,
		ScreenPartComponent,
		StillThereComponent,
		GameCategoryCardComponent,
		UserCrmFormComponent
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
