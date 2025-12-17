import {Injectable} from '@angular/core';
import {GameQuestionModel} from '../../shared/models/game-question.model';
import {GameQuestionAnswerModel} from '../../shared/models/game-question-answer.model';

@Injectable({
	providedIn: 'root'
})
export class GameQuestionsService
{
	public questions: Array<GameQuestionModel> = [
		new GameQuestionModel(
			'Welchen Wirkstoff enthält Mucosilent ® gegen Reizhusten?',
			[
				new GameQuestionAnswerModel(
					'Levodropropizin'
				),
				new GameQuestionAnswerModel(
					'Codein'
				),
				new GameQuestionAnswerModel(
					'Eukalyptus'
				)
			],
			0
		),
		new GameQuestionModel(
			'Für wen ist Mucosilent® geeignet?',
			[
				new GameQuestionAnswerModel(
					'Nur für Erwachsene'
				),
				new GameQuestionAnswerModel(
					'Kinder ab 2 Jahren, Erwachsene & Senioren'
				),
				new GameQuestionAnswerModel(
					'Kinder bis 5 Jahre'
				)
			],
			1
		),
		new GameQuestionModel(
			'Wo setzt die Wirkung von Mucosilent® an?',
			[
				new GameQuestionAnswerModel(
					'Im Gehirn'
				),
				new GameQuestionAnswerModel(
					'Peripher – also außerhalb des Gehirns'
				),
				new GameQuestionAnswerModel(
					'Im Magen-Darm-Trakt'
				)
			],
			1
		),
	];
	
	public currentQuestion: GameQuestionModel = this.questions[0];
	public selectedAnswerIndex: number = -1;
	
	public maxQuestionNr: number = 3;
	public validAnswerCount: number = 0;
	
	public init(): void
	{
		this.currentQuestion = this.questions[0];
		this.validAnswerCount = 0;
		
		for (const question of this.questions)
		{
			for (const answer of question.answers)
			{
				answer.init();
			}
		}
	}
	
	public get questionIndex(): number
	{
		return this.questions.indexOf(this.currentQuestion);
	}
	
	public selectAnswer(index: number): void
	{
		if (this.currentQuestion.rightAnswerIndex === index)
		{
			this.validAnswerCount++;
		}
		
		this.selectedAnswerIndex = index;
	}
	
	public setNextQuestion(): void
	{
		if (this.questionIndex >= this.questions.length - 1)
		{
			this.currentQuestion = this.questions[0];
			return;
		}
		
		this.currentQuestion = this.questions[this.questions.indexOf(this.currentQuestion) + 1];
	}
}
