import {Injectable, signal} from '@angular/core';
import {GameScoreModel} from '../../shared/models/game-score.model';

@Injectable({
	providedIn: 'root'
})
export class UserGameService
{
	private gameScore!: GameScoreModel;
	public readonly signalGameScore = signal<GameScoreModel>(this.gameScore);
	
	constructor()
	{
		this.resetGameScore();
	}
	
	public resetGameScore(): void
	{
		this.gameScore = new GameScoreModel('', 0, 0, '');
		this.signalGameScore.set(this.gameScore);
	}
	
	public setNickname(nickname: string): void
	{
		this.gameScore.nickname = nickname;
		this.signalGameScore.update(
			(gameScoreModel) => ({...gameScoreModel, nickname: nickname})
		);
	}
	
	public addScore(score: number): void
	{
		this.setScore(this.signalGameScore().score + score);
	}
	
	public setScore(score: number): void
	{
		this.gameScore.score = score;
		this.signalGameScore.update(
			(gameScoreModel) => ({...gameScoreModel, score: score})
		);
	}
	
	public setCorrectRate(correctRate: number): void
	{
		this.gameScore.correctRate = correctRate;
		this.signalGameScore.update(
			(gameScoreModel) => ({...gameScoreModel, correctRate: correctRate})
		);
	}
	
	public setCurrentDateTime(): void
	{
		const now = new Date();
		
		const year = now.getUTCFullYear();
		const month = now.getUTCMonth() + 1;
		const day = now.getUTCDate();
		const hours = now.getUTCHours();
		const minutes = now.getUTCMinutes();
		const seconds = now.getUTCSeconds();
		
		this.gameScore.createdAt = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	}
}
