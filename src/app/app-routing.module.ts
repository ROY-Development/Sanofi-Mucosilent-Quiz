import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AppRoutesEnum} from './app-routes.enum';
import {NotFoundComponent} from './pages/not-found/not-found.component';
import {BasePageComponent} from './pages/base-page/base-page.component';
import {IdlePageComponent} from './pages/idle-page/idle-page.component';
import {HowToPlayPageComponent} from './pages/how-to-play-page/how-to-play-page.component';
import {QuestionPageComponent} from './pages/question-page/question-page.component';
import {QuestionResultPageComponent} from './pages/question-result-page/question-result-page.component';
import {QuestionEndPageComponent} from './pages/question-end-page/question-end-page.component';

const routes: Routes = [
	{path: AppRoutesEnum.base, component: BasePageComponent, data: {animation: 'BasePage'}},
	{path: AppRoutesEnum.idle, component: IdlePageComponent, data: {animation: 'StartPage'}},
	{path: AppRoutesEnum.howToPlay, component: HowToPlayPageComponent, data: {animation: 'HowToPlayPage'}},
	{path: AppRoutesEnum.question, component: QuestionPageComponent, data: {animation: 'QuestionPage'}},
	{
		path: AppRoutesEnum.questionResult,
		component: QuestionResultPageComponent,
		data: {animation: 'QuestionResultPage'}
	},
	{path: AppRoutesEnum.questionEnd, component: QuestionEndPageComponent, data: {animation: 'QuestionEndPage'}},
	//{path: AppRoutesEnum.game, component: GamePageComponent, data: {animation: 'GamePage'}},
	//{path: AppRoutesEnum.gameTopic, component: GameTopicPageComponent, data: {animation: 'GameTopicPage'}},
	//{path: AppRoutesEnum.endGame, component: EndGamePageComponent, data: {animation: 'EndGamePage'}},
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
