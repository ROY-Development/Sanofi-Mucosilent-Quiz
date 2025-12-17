import {Injectable, signal} from '@angular/core';
import {AppRoutesEnum} from '../../app-routes.enum';

@Injectable({
	providedIn: 'root'
})
export class PanelService
{
	public readonly signalIsGameHeaderEnabled = signal<boolean>(false);
	//public readonly signalIsGameScoreEnabled = signal<boolean>(false);
	
	private gameHeaderUrls: Array<string>;
	
	//private gameScoreUrls: Array<string>;
	
	constructor()
	{
		this.gameHeaderUrls = [
			AppRoutesEnum.startGame,
			AppRoutesEnum.gameCountdown,
			//AppRoutesEnum.gameTopic,
			AppRoutesEnum.game
			//	AppRoutesEnum.question,
			//	AppRoutesEnum.questionResult
		].map((value) => {
			return '/' + value;
		});
		
		/*this.gameScoreUrls = [
			AppRoutesEnum.base,
			AppRoutesEnum.start,
			AppRoutesEnum.logon,
			AppRoutesEnum.acceptLegal,
			AppRoutesEnum.nickname
		].map((value) => {
			return '/' + value;
		});*/
	}
	
	public updateRoute(url: string): void
	{
		this.signalIsGameHeaderEnabled.set(this.gameHeaderUrls.indexOf(url) !== -1);
		//this.signalIsGameScoreEnabled.set(this.gameScoreUrls.indexOf(url) !== -1);
	}
}
