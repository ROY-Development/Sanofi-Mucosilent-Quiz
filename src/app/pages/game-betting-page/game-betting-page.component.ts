import {Component, inject, signal} from '@angular/core';
import {AppRoutesEnum} from '../../app-routes.enum';
import {InitService} from '../../core/services/init.service';
import {UserGameService} from '../../core/services/user-game.service';
import {GameService} from '../../core/services/game.service';

@Component({
	selector: 'app-game-betting-page',
	templateUrl: './game-betting-page.component.html',
	styleUrl: './game-betting-page.component.scss',
	standalone: false
})
export class GameBettingPageComponent
{
	protected gameService = inject(GameService);
	protected userGameService = inject(UserGameService);
	private initService = inject(InitService);
	
	protected score: number = 0;
	
	protected readonly signalBetScore = signal<number>(0);
	
	constructor()
	{
		this.score = this.userGameService.signalGameScore().score || 100;
	}
	
	protected onChangeBetScore(betScore: number): void
	{
		this.signalBetScore.set(betScore);
	}
	
	protected onClickContinue(): void
	{
		this.gameService.setNextMultiplierGame();
		this.initService.navigateToRoute(AppRoutesEnum.gameMultiplier).then();
	}
}