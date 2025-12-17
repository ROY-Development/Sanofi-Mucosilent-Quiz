import {inject, Injectable, signal} from '@angular/core';
import {UtilArray} from '../../shared/utils/util-array';
import {TopicModel} from '../../shared/models/topic.model';
import {AppRoutesEnum} from '../../app-routes.enum';
import {InitService} from './init.service';
import {AppConfig} from '../../app.config';
import {TopicQuestionResultModel} from '../../shared/models/topic-question-result.model';
import {BaseService} from './base.service';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {RequestOptionsModel} from '../../shared/models/request-options.model';
import {HttpMethodsEnum} from '../../shared/enums/http-methods.enum';
import {GameConfigModel} from '../../shared/models/game-config.model';
import {Point2DInterface} from '../../games/interfaces/point-2D.interface';
import {UserGameService} from './user-game.service';
import {GameHeaderService} from './game-header.service';
import {ScormService} from './scorm.service';

@Injectable({
	providedIn: 'root'
})
export class GameService extends BaseService
{
	private initService = inject(InitService);
	private userGameService = inject(UserGameService);
	public gameHeaderService = inject(GameHeaderService);
	private scormService = inject(ScormService);
	
	public readonly signalGameConfig = signal<GameConfigModel | null>(null);
	public readonly signalQuizGameId = signal<number | null>(null);
	public readonly signalCurrentMultiplierGame = signal<number>(0);
	public readonly signalQuizNumber = signal<number>(1);
	public readonly signalIsGameRunning = signal<boolean>(false);
	public readonly signalGameTitleImage = signal<string | null>(null);
	
	public readonly signalHasShownEndGameConfetti = signal<boolean>(false);
	
	// used for handling highscore page <-> end-page routes
	public readonly signalHasEnteredHighscore = signal<boolean>(false);
	public highscorePageBackRoute: AppRoutesEnum = AppRoutesEnum.base;
	
	public topics: Array<TopicModel> = [
		//	new TopicModel(1, '', 'assets/games/swipe-yes-no/json/category-1.json'),
		//	new TopicModel(2, '', 'assets/games/swipe-yes-no/json/category-3.json'),
		//	new TopicModel(3, '', 'assets/games/swipe-yes-no/json/category-5.json')
	];
	
	public oldTopicsHistory: Array<{ topics: Array<TopicModel>, isLeft: boolean }> = [];
	public currentTopics: Array<TopicModel> = [];
	
	public currentTopic: TopicModel | null = null;
	
	public currentQuestionIndex: number = -1;
	public goldenQuestionIndex: number = 0;
	
	public topicQuestionResultList: Array<TopicQuestionResultModel> = []; // collect results per task
	public gameQuestionResultList: Array<TopicQuestionResultModel> = [];  // collect results per whole game
	
	public init(): void
	{
		this.signalCurrentMultiplierGame.set(0);
		this.signalQuizNumber.set(AppConfig.startQuiz);
		
		this.signalHasShownEndGameConfetti.set(false);
		
		// used for handling highscore page <-> endpage routes
		this.signalHasEnteredHighscore.set(false);
		this.highscorePageBackRoute = AppRoutesEnum.base;
		
		this.oldTopicsHistory = [];
		this.refreshCurrentTopics();
		
		const maxQuizRoundCount: number = this.signalGameConfig() ?
			this.signalGameConfig()!.maxQuizRoundCount : AppConfig.maxQuizRoundCount;
		const maxQuizQuestionCount: number = this.signalGameConfig() ?
			this.signalGameConfig()!.maxQuizQuestionCount : AppConfig.maxQuizQuestionCount;
		const maxTopicQuestions: number = maxQuizRoundCount * maxQuizQuestionCount;
		const startGoldenIndex: number = 3;
		
		this.currentQuestionIndex = -1;
		this.goldenQuestionIndex = Math.floor(startGoldenIndex + (maxTopicQuestions - startGoldenIndex) * Math.random());
		
		if (AppConfig.isDebugConsole)
		{
			console.log('GOLDEN question index:', this.goldenQuestionIndex);
		}
		
		this.topicQuestionResultList = [];
		this.gameQuestionResultList = [];
		
		this.userGameService.resetGameScore();
		this.gameHeaderService.resetGameScore();
	}
	
	public refreshCurrentTopics(): void
	{
		this.currentTopics = [];
		this.topics.forEach((value) => {
			this.currentTopics.push(value);
		});
		
		this.currentTopics = UtilArray.shuffleArray(this.currentTopics);
		
		// use category ID from url as the first category
		// https://editor-speed-quiz.r-o-y.de/?categoryId=8
		if (this.initService.signalAppQueryParams() && this.initService.signalAppQueryParams().categoryId)
		{
			const firstCategoryId: string = this.initService.signalAppQueryParams().categoryId!;
			
			for (const topic of this.currentTopics)
			{
				if (topic.url.indexOf('category-' + firstCategoryId + '.json') != -1)
				{
					const [item] = this.currentTopics.splice(this.currentTopics.indexOf(topic), 1);
					this.currentTopics.unshift(item);
					break;
				}
			}
		}
		
		if (AppConfig.isDebugConsole)
		{
			console.log(this.currentTopics);
		}
	}
	
	public getBaseConfig(): Observable<any | null>
	{
		const queryParams: any = {};
		if (this.initService.qz)
		{
			queryParams.qz = this.initService.qz;
		}
		
		let url: string;
		let requestOptions: RequestOptionsModel;
		
		if (!this.initService.qz) //this.initService.isScormPackage)
		{
			url = BaseService.getBaseApiUrl() + 'assets/json/config';
			requestOptions = new RequestOptionsModel(
				url,
				HttpMethodsEnum.get,
				null,
				null,
				null,
				null,
				'.json'
			);
		}
		else
		{
			url = BaseService.getBaseApiUrl() + 'api/game/get-config';
			requestOptions = new RequestOptionsModel(
				url,
				HttpMethodsEnum.get,
				null,
				queryParams
			);
		}
		
		return this.doHttpRequest<any | null>(
			requestOptions,
			(httpResponse: HttpResponse<any>): any | null => {
				if (httpResponse.body)
				{
					if (httpResponse.body.qz)
					{
						this.signalQuizGameId.set(parseInt(httpResponse.body.qz, 10));
					}
					else
					{
						this.initService.qz = null;
					}
					if (httpResponse.body.qz && httpResponse.body.config)
					{
						this.signalGameConfig.set(GameConfigModel.getModelFromJSON(httpResponse.body.config));
					}
					
					if (httpResponse.body.files)
					{
						this.topics = [];
						
						const files: Array<string> = httpResponse.body.files;
						
						let basePath: string;
						if (this.signalGameConfig()?.isFtpReady)
						{
							basePath = '';
						}
						else if (this.signalQuizGameId())
						{
							basePath = `uploads/quiz-game/categories/`;
						}
						else
						{
							basePath = 'uploads/quiz-game/base/categories/';
						}
						
						for (let i = 0, n = files.length; i < n; ++i)
						{
							const configFileUrl: string = basePath + files[i];
							
							// get base path string from file url
							const parts = configFileUrl.split("/");
							parts.pop(); // remove file name
							const dirBasePath: string = parts.join("/");
							
							this.topics.push(new TopicModel(i + 1, '', configFileUrl, dirBasePath));
						}
						this.currentTopics = [];
						this.topics.forEach((value) => {
							this.currentTopics.push(value);
						});
						this.currentTopics = UtilArray.shuffleArray(this.currentTopics);
					}
					
					return httpResponse.body;
				}
				
				return null;
			},
			(httpErrorResponse: HttpErrorResponse): Observable<string> => {
				return this.onLoadError(httpErrorResponse);
			}
		);
	}
	
	public setCurrentTopic(topicId: number): void //, isRemovingOtherTopic: boolean = false): void
	{
		let newTopic: TopicModel | null = null;
		
		for (const topic of this.currentTopics)
		{
			if (topicId === topic.id)
			{
				newTopic = topic;
			}
		}
		
		if (newTopic)
		{
			const index: number = this.currentTopics.indexOf(newTopic);
			
			const oldTopics: Array<TopicModel> = [];
			if (this.currentTopics.length > 0)
			{
				oldTopics.push(this.currentTopics[0]);
			}
			if (this.currentTopics.length > 1)
			{
				oldTopics.push(this.currentTopics[1]);
			}
			
			this.oldTopicsHistory.push({topics: oldTopics, isLeft: index === 0});
			
			this.currentTopic = newTopic;
			this.currentTopics.splice(index, 1);
			/*if (isRemovingOtherTopic)
			{
				this.currentTopics.shift();
			}*/
			this.currentTopics = UtilArray.shuffleArray(this.currentTopics);
		}
		else
		{
			this.currentTopic = null;
		}
		
		if (AppConfig.isDebugConsole)
		{
			console.log('rest topics', this.currentTopics);
		}
		
		this.topicQuestionResultList = [];
	}
	
	public setNextMultiplierGame(): void
	{
		let nextGame: number = this.signalCurrentMultiplierGame();
		
		if (
			this.signalGameConfig()?.activeMiniGames &&
			this.signalGameConfig()!.activeMiniGames.length > 0
		)
		{
			let index: number = this.signalGameConfig()!.activeMiniGames.indexOf(nextGame);
			
			if (index === -1 || index >= this.signalGameConfig()!.activeMiniGames.length - 1)
			{
				nextGame = this.signalGameConfig()!.activeMiniGames[0];
			}
			else
			{
				index++;
				nextGame = this.signalGameConfig()!.activeMiniGames[index];
			}
			// console.log('special', nextGame);
		}
		else if (nextGame === 0)
		{
			nextGame = AppConfig.startMultiplierGame;
		}
		else
		{
			nextGame++;
			if (nextGame > AppConfig.maxMultiplierGameCount)
			{
				nextGame = 1;
			}
			// console.log('base', nextGame);
		}
		
		this.signalCurrentMultiplierGame.set(nextGame);
	}
	
	public setIsGameRunning(isRunning: boolean): void
	{
		this.signalIsGameRunning.set(isRunning);
	}
	
	public setQuizNumber(quizNumber: number): void
	{
		this.signalQuizNumber.set(quizNumber);
	}
	
	public addTopicQuestionScore(topicQuestionResult: TopicQuestionResultModel): void
	{
		this.topicQuestionResultList.push(topicQuestionResult);
		this.gameQuestionResultList.push(topicQuestionResult);
	}
	
	public getTotalTopicQuestionScore(): number
	{
		let score: number = 0;
		for (const value of this.topicQuestionResultList)
		{
			score += value.totalScore;
		}
		
		return score;
	}
	
	public getTotalValidGameQuestions(): number
	{
		const gameQuestionResultList = this.gameQuestionResultList.filter((value) => {
			return value.isSelectedCorrect
		})
		
		return gameQuestionResultList.length;
	}
	
	public getCorrectGameQuestionsRate(): number
	{
		const rate = this.getTotalValidGameQuestions() / Math.max(0.1, this.gameQuestionResultList.length);
		return Math.round(rate * 1000) / 1000; // → 3 comma separated digits e.q. 0.876
	}
	
	public getCorrectGameQuestionsPercentage(): number
	{
		return Math.round(this.getCorrectGameQuestionsRate() * 1000) / 10;
	}
	
	public isScormFinished(): boolean
	{
		const scormQuestionFinishPercentage: number = this.signalGameConfig()?.scormQuestionFinishPercentage ?? 0;
		
		return this.getCorrectGameQuestionsPercentage() >= scormQuestionFinishPercentage;
	}
	
	public updateLastTopicQuestionComboScore(comboScore: number): void
	{
		const listLength: number = this.topicQuestionResultList.length;
		if (listLength > 0)
		{
			this.topicQuestionResultList[listLength - 1].comboScore = comboScore;
			this.topicQuestionResultList[listLength - 1].totalScore += comboScore;
		}
	}
	
	public getCorrectComboCount(): number
	{
		const copyArray = [...this.topicQuestionResultList];
		copyArray.reverse();
		
		let count: number = 0;
		for (const value of copyArray)
		{
			if (value.score > 0)
			{
				count++;
			}
			else
			{
				break;
			}
		}
		
		return count;
	}
	
	public finishGameFully(): void
	{
		/*if (this.userGameService.signalGameScore().nickname.length > 0)
		{
			this.userGameService.setCurrentDateTime();
			
			if (this.gameScoreService.doesNicknameExists(this.userGameService.signalGameScore().nickname))
			{
				//  this.electronService.updateCSVRow(this.userGameService.signalGameScore());
				this.gameScoreService.updateGameScore(this.userGameService.signalGameScore());
			}
			else
			{
				//  this.electronService.addCSVRow(this.userGameService.signalGameScore());
				this.gameScoreService.addGameScore(this.userGameService.signalGameScore());
			}
		}*/
		
		if (this.scormService.scormAPI)
		{
			const currentScormScoreStr = this.scormService.getValue('cmi.core.score.raw');
			const scormScore: number = currentScormScoreStr ? parseInt(currentScormScoreStr, 10) : 0;
			const correctGameQuestionsPercentage: number = this.getCorrectGameQuestionsPercentage();
			
			if (correctGameQuestionsPercentage > scormScore)
			{
				this.scormService.setValue('cmi.core.score.raw', correctGameQuestionsPercentage);
			}
			
			const currentLessonStatus: string | null = this.scormService.getValue('cmi.core.lesson_status');
			
			if (currentLessonStatus !== 'completed')
			{
				if (this.isScormFinished())
				{
					this.scormService.setValue('cmi.core.lesson_status', 'completed');
				}
				else
				{
					this.scormService.setValue('cmi.core.lesson_status', 'failed');
				}
			}
		}
		
		//this.soundService.fadeOutSound('gameMultiplierMusic', 400, StopTypeEnum.stop);
		
		/*if (
			!this.initService.isScormPackage &&
			this.signalGameConfig()?.quizConfigCrm?.isEnabled
		)
		{
			this.initService.navigateToRoute(AppRoutesEnum.endGameCrm).then();
		}
		else
		{
			this.initService.navigateToRoute(AppRoutesEnum.endGame).then();
		}*/
	}
	
	public getDistance(point1: Point2DInterface, point2: Point2DInterface): number
	{
		const dx = point2.x - point1.x;
		const dy = point2.y - point1.y;
		return Math.sqrt(dx * dx + dy * dy);
	}
	
	public getRotationRadianAngle(point1: Point2DInterface, point2: Point2DInterface): number
	{
		const dx = point2.x - point1.x;
		const dy = point2.y - point1.y;
		return Math.atan2(dy, dx);
	}
}
