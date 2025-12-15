import {NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {BasePageComponent} from './base-page/base-page.component';
import {IdlePageComponent} from './idle-page/idle-page.component';
import {NotFoundComponent} from './not-found/not-found.component';
import {RouterLink} from '@angular/router';
import {CoreModule} from '../core/core.module';
import {ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared.module';
import {GamePageComponent} from './game-page/game-page.component';
import {GamesModule} from '../games/games.module';
import {HowToPlayPageComponent} from './how-to-play-page/how-to-play-page.component';
import {EndGamePageComponent} from './end-game-page/end-game-page.component';
import {GameMultiplierPageComponent} from './game-multiplier-page/game-multiplier-page.component';
import {GameTopicPageComponent} from './game-topic-page/game-topic-page.component';
import {GameHighScorePageComponent} from './game-high-score-page/game-high-score-page.component';
import {GameBettingPageComponent} from './game-betting-page/game-betting-page.component';
import {GfxSplineComponent} from '../core/components/gfx-spline/gfx-spline.component';
import {DialogLegalComponent} from '../core/components/dialogs/dialog-legal/dialog-legal.component';
import {EndGameCrmPageComponent} from './end-game-crm-page/end-game-crm-page.component';
import {BaseButtonComponent} from '../core/components/buttons/base-button/base-button.component';
import {
	AniSplitScreenTitleComponent
} from '../shared/components/ani-split-screen-title/ani-split-screen-title.component';
import {ButtonStartComponent} from '../core/components/buttons/button-start/button-start.component';
import {ConfettiComponent} from '../shared/components/confetti/confetti.component';

@NgModule({
	declarations: [
		BasePageComponent,
		GameBettingPageComponent,
		GamePageComponent,
		IdlePageComponent,
		NotFoundComponent,
		HowToPlayPageComponent,
		EndGamePageComponent,
		GameMultiplierPageComponent,
		GameTopicPageComponent,
		GameHighScorePageComponent,
		EndGameCrmPageComponent
	],
	imports: [
		CommonModule,
		RouterLink,
		CoreModule,
		ReactiveFormsModule,
		NgOptimizedImage,
		GamesModule,
		SharedModule,
		GfxSplineComponent,
		DialogLegalComponent,
		BaseButtonComponent,
		AniSplitScreenTitleComponent,
		ButtonStartComponent,
		ConfettiComponent
	]
})
export class PagesModule
{
}
