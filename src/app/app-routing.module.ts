import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AppRoutesEnum} from './app-routes.enum';
import {NotFoundComponent} from './pages/not-found/not-found.component';
import {BasePageComponent} from './pages/base-page/base-page.component';
import {IdlePageComponent} from './pages/idle-page/idle-page.component';
import {HowToPlayPageComponent} from './pages/how-to-play-page/how-to-play-page.component';
import {GamePageComponent} from './pages/game-page/game-page.component';
import {GameBettingPageComponent} from './pages/game-betting-page/game-betting-page.component';
import {GameMultiplierPageComponent} from './pages/game-multiplier-page/game-multiplier-page.component';
import {GameTopicPageComponent} from './pages/game-topic-page/game-topic-page.component';
import {EndGamePageComponent} from './pages/end-game-page/end-game-page.component';
import {GameHighScorePageComponent} from "./pages/game-high-score-page/game-high-score-page.component";
import {EndGameCrmPageComponent} from './pages/end-game-crm-page/end-game-crm-page.component';

const routes: Routes = [
	{path: AppRoutesEnum.base, component: BasePageComponent, data: {animation: 'BasePage'}},
	{path: AppRoutesEnum.idle, component: IdlePageComponent, data: {animation: 'StartPage'}},
	{path: AppRoutesEnum.howToPlay, component: HowToPlayPageComponent, data: {animation: 'HowToPlayPage'}},
	{path: AppRoutesEnum.highScore, component: GameHighScorePageComponent, data: {animation: 'GameHighScorePage'}},
	{
		path: AppRoutesEnum.highScoreWeekly,
		component: GameHighScorePageComponent,
		data: {animation: 'GameHighScoreWeeklyPage'}
	},
	{
		path: AppRoutesEnum.highScoreMonthly,
		component: GameHighScorePageComponent,
		data: {animation: 'GameHighScoreMonthlyPage'}
	},
	{path: AppRoutesEnum.game, component: GamePageComponent, data: {animation: 'GamePage'}},
	{path: AppRoutesEnum.gameBetting, component: GameBettingPageComponent, data: {animation: 'GameBettingPage'}},
	{
		path: AppRoutesEnum.gameMultiplier,
		component: GameMultiplierPageComponent,
		data: {animation: 'GameMultiplierPage'}
	},
	{path: AppRoutesEnum.gameTopic, component: GameTopicPageComponent, data: {animation: 'GameTopicPage'}},
	{path: AppRoutesEnum.endGameCrm, component: EndGameCrmPageComponent, data: {animation: 'EndGameCrmPage'}},
	{path: AppRoutesEnum.endGame, component: EndGamePageComponent, data: {animation: 'EndGamePage'}},
	{path: '', pathMatch: 'full', redirectTo: '/'},
	{path: '**', component: NotFoundComponent, data: {animation: 'NotFoundPage'}}
];

@NgModule({
	imports: [RouterModule.forRoot(routes, {
		enableViewTransitions: false  // Ausgeschaltet für manuellen Ansatz
	})],
	exports: [RouterModule]
})
export class AppRoutingModule
{
}
