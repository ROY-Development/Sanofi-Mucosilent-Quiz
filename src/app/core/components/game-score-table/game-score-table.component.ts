import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	effect,
	inject,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	signal,
	SimpleChanges
} from '@angular/core';
import {UntilDestroy} from '@ngneat/until-destroy';
import {AppConfig} from '../../../app.config';
import {GameScoreService} from '../../services/game-score.service';
import {UserGameService} from '../../services/user-game.service';
import {ImageLoadService} from '../../services/image-load.service';
import {NativeTranslateService} from "../../services/native-translate.service";
import {IframeEventRuleService} from '../../services/iframe-event-rule.service';

@UntilDestroy()
@Component({
	selector: 'app-game-score-table',
	templateUrl: './game-score-table.component.html',
	styleUrls: ['./game-score-table.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: false
})
export class GameScoreTableComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
	protected gameScoreService = inject(GameScoreService);
	protected userGameService = inject(UserGameService);
	private imageLoadService = inject(ImageLoadService);
	protected nativeTranslateService = inject(NativeTranslateService);
	protected iFrameEventRuleService = inject(IframeEventRuleService);
	
	@Input() public isLoading: boolean = false;
	@Input() public colorFont: string = AppConfig.quizGameDefaultFontColorMain;
	@Input() public colorFontHeader: string = AppConfig.quizGameDefaultFontColorMain;
	@Input() public colorBackground: string = AppConfig.quizGameDefaultTableBackgroundColor;
	@Input() public colorBackgroundRowOdd: string = AppConfig.quizGameDefaultTableBackgroundRowOddColor;
	@Input() public borderRadius: number = AppConfig.quizGameDefaultTableRadiusPx;
	@Input() public border: number = AppConfig.quizGameDefaultTableBorderPx;
	@Input() public borderColor: string = AppConfig.quizGameDefaultTableBorderColor;
	@Input() public fontColorRank: string = AppConfig.quizGameDefaultTableRankFontColor;
	@Input() public rankColorBackground1: string = AppConfig.quizGameDefaultTableRankFontColor;
	@Input() public rankColorBackground2: string = AppConfig.quizGameDefaultTableRankFontColor;
	@Input() public rankColorBackground3: string = AppConfig.quizGameDefaultTableRankFontColor;
	@Input() public rankColorBackground4: string = AppConfig.quizGameDefaultTableRankFontColor;
	@Input() public rankAniDuration: number = AppConfig.quizGameDefaultTableRankAniDuration;
	@Input() public rankBorderRadius: number = AppConfig.quizGameDefaultTableRankRadiusPx;
	@Input() public rankBorder: number = AppConfig.quizGameDefaultTableRankBorderPx;
	@Input() public rankBorderColor: string = AppConfig.quizGameDefaultTableRankBorderColor;
	
	@Input() public userRowColorFont: string = AppConfig.quizGameDefaultFontColorMain;
	@Input() public userRowColorBackground: string = AppConfig.quizGameDefaultTableBackgroundColor;
	@Input() public userRowBorderRadius: number = AppConfig.quizGameDefaultTableRadiusPx;
	@Input() public userRowBorder: number = AppConfig.quizGameDefaultTableBorderPx;
	@Input() public userRowBorderColor: string = AppConfig.quizGameDefaultTableBorderColor;
	
	@Input() public userRankColorFont: string = AppConfig.quizGameDefaultTableRankFontColor;
	@Input() public userRankColorBackground1: string = AppConfig.quizGameDefaultTableRankBackgroundColor1;
	@Input() public userRankColorBackground2: string = AppConfig.quizGameDefaultTableRankBackgroundColor2;
	@Input() public userRankColorBackground3: string = AppConfig.quizGameDefaultTableRankBackgroundColor3;
	@Input() public userRankColorBackground4: string = AppConfig.quizGameDefaultTableRankBackgroundColor4;
	@Input() public userRankAniDuration: number = AppConfig.quizGameDefaultTableRankAniDuration;
	@Input() public userRankBorderRadius: number = AppConfig.quizGameDefaultTableRankRadiusPx;
	@Input() public userRankBorder: number = AppConfig.quizGameDefaultTableRankBorderPx;
	@Input() public userRankBorderColor: string = AppConfig.quizGameDefaultTableRankBorderColor;
	
	protected readonly signalUserRank = signal<number>(-1);
	
	protected readonly signalAnimationAngleDegrees = signal<number>(360);
	protected readonly signalRankGradient = signal<string>(`linear-gradient(${this.signalAnimationAngleDegrees()}deg,
					${this.rankColorBackground1} 3%,
					${this.rankColorBackground2} 58%,
					${this.rankColorBackground3} 68%,
					${this.rankColorBackground4} 98%)`);
	
	protected readonly signalUserRankGradient = signal<string>(`linear-gradient(${this.signalAnimationAngleDegrees()}deg,
					${this.userRankColorBackground1} 3%,
					${this.userRankColorBackground2} 58%,
					${this.userRankColorBackground3} 68%,
					${this.userRankColorBackground4} 98%)`);
	// private loopReq: number = -1;
	
	public frontImageUrl: string = 'none';
	
	protected readonly AppConfig = AppConfig;
	
	constructor()
	{
		effect(() => {
			if (this.gameScoreService.signalTopGameScores())
			{
				if (this.userGameService.signalGameScore() !== null)
				{
					this.signalUserRank.set(this.gameScoreService.getRankByGameScore(this.userGameService.signalGameScore()));
				}
				else
				{
					this.signalUserRank.set(-1);
				}
			}
		});
	}
	
	public ngOnInit(): void
	{
		const image: HTMLImageElement | null = this.imageLoadService.getImage('crabFrontImage');
		if (image)
		{
			this.frontImageUrl = `url('${image.src}')`;
		}
		
		//	this.loop();
	}
	
	public ngAfterViewInit(): void
	{
		this.updateRankGradient();
		this.updateUserRankGradient();
	}
	
	public ngOnChanges(changes: SimpleChanges): void
	{
		if (
			'rankColorBackground1' in changes ||
			'rankColorBackground2' in changes ||
			'rankColorBackground3' in changes ||
			'rankColorBackground4' in changes
		)
		{
			this.updateRankGradient();
		}
		
		if (
			'userRankColorBackground1' in changes ||
			'userRankColorBackground2' in changes ||
			'userRankColorBackground3' in changes ||
			'userRankColorBackground4' in changes
		)
		{
			this.updateUserRankGradient();
		}
	}
	
	public ngOnDestroy(): void
	{
		/*if (this.loopReq !== -1)
		{
			window.cancelAnimationFrame(this.loopReq);
		}*/
	}
	
	/*private loop(): void
	{
		this.signalAnimationAngleDegrees.set(this.signalAnimationAngleDegrees() - 1);
		if (this.signalAnimationAngleDegrees() < 0)
		{
			this.signalAnimationAngleDegrees.set(360);
		}
		window.requestAnimationFrame(this.loop.bind(this));
	}*/
	
	private updateRankGradient(): void
	{
		this.signalRankGradient.set(`linear-gradient(${this.signalAnimationAngleDegrees()}deg,
					${this.rankColorBackground1} 3%,
					${this.rankColorBackground2} 58%,
					${this.rankColorBackground3} 68%,
					${this.rankColorBackground4} 98%)`);
	}
	
	private updateUserRankGradient(): void
	{
		this.signalUserRankGradient.set(`linear-gradient(${this.signalAnimationAngleDegrees()}deg,
					${this.userRankColorBackground1} 3%,
					${this.userRankColorBackground2} 58%,
					${this.userRankColorBackground3} 68%,
					${this.userRankColorBackground4} 98%)`);
	}
}
