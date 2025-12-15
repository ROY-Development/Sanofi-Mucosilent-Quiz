import {Injectable, signal} from '@angular/core';
import {GameScoreModel} from '../../shared/models/game-score.model';
import {UtilArray} from '../../shared/utils/util-array';

@Injectable({
	providedIn: 'root'
})
export class GameScoreService
{
	public static maxGameHighScoreCount: number = 50;
	
	private gameScores: Array<GameScoreModel> = [];
	private originalGameScores: Array<GameScoreModel> = [];
	public topGameScores: Array<GameScoreModel> = [];
	public readonly signalGameScores = signal<Array<GameScoreModel>>([]);
	public readonly signalTopGameScores = signal<GameScoreModel[]>([]);
	public readonly signalExistingGsNumbers = signal<Array<number>>([]);
	public readonly signalExistingNicknames = signal<Array<string>>([]);
	
	public setScores(list: Array<GameScoreModel>): void
	{
		this.originalGameScores = list;
		this.updateGameScores();
	}
	
	public addGameScore(gameScore: GameScoreModel): void
	{
		this.originalGameScores.push(gameScore);
		this.updateGameScores();
	}
	
	public updateGameScore(gameScore: GameScoreModel): void
	{
		for (const currentGameScore of this.originalGameScores)
		{
			if (gameScore.nickname.trim() === currentGameScore.nickname.trim())
			{
				if (gameScore.score > currentGameScore.score)
				{
					currentGameScore.nickname = gameScore.nickname;
					currentGameScore.score = gameScore.score;
					currentGameScore.createdAt = gameScore.createdAt;
					
					this.updateGameScores();
				}
				break;
			}
		}
	}
	
	public doesNicknameExists(nickname: string): boolean
	{
		return this.signalExistingNicknames().includes(nickname.toLowerCase().trim());
	}
	
	public getGameScoreByNickname(nickname: string): GameScoreModel | null
	{
		for (const value of this.originalGameScores)
		{
			if (value.nickname === nickname)
			{
				return value;
			}
		}
		
		return null;
	}
	
	public getRankByGameScore(gameScore: GameScoreModel): number
	{
		let rank: number = 1;
		for (const value of this.topGameScores)
		{
			if (
				value.nickname === gameScore.nickname &&
				value.score === gameScore.score &&
				value.correctRate === gameScore.correctRate
			)
			{
				return rank;
			}
			rank++;
		}
		
		return -1;
	}
	
	private updateGameScores(): void
	{
		this.gameScores = UtilArray.sortBy(this.originalGameScores, 'score', false);
		this.signalGameScores.set(this.gameScores);
		
		this.topGameScores = this.gameScores.slice(0, GameScoreService.maxGameHighScoreCount);
		
		if (this.topGameScores.length < GameScoreService.maxGameHighScoreCount)
		{
			for (let i = this.topGameScores.length; i < GameScoreService.maxGameHighScoreCount; i++)
			{
				this.topGameScores.push(new GameScoreModel('', 0, 0, ''));
			}
		}
		
		this.signalTopGameScores.set(this.topGameScores);
		
		/*this.signalExistingGsNumbers.set(this.originalGameScores.map((value) => {
			return parseInt(value.gsNumber, 10);
		}));*/
		
		this.signalExistingNicknames.set(this.originalGameScores.map((value) => {
			return value.nickname.toLowerCase().trim();
		}));
		// console.log(this.gameScores)
	}
}
