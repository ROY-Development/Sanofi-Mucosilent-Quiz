import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class GameQuestionsService
{
	public questions: Array<any> = [
		{
			question: 'Was ist ein Komponenten-Test?',
			answer1: 'Eine Softwaretestmethode, die einzelne, isolierte Bausteine einer Anwendung überprüft.',
			answer2: 'Wat wer bist du denn?',
			answer3: 'Tropfendes Schweinefleisch',
			rightAnswerIndex: 0
		},
		{
			question: 'Was ist ein Komponenten-Test? 2',
			answer1: 'Eine Softwaretestmethode, die einzelne, isolierte Bausteine einer Anwendung überprüft.',
			answer2: 'Wat wer bist du denn?',
			answer3: 'Tropfendes Schweinefleisch',
			rightAnswerIndex: 0
		},
		{
			question: 'Was ist ein Komponenten-Test? 3',
			answer1: 'Eine Softwaretestmethode, die einzelne, isolierte Bausteine einer Anwendung überprüft.',
			answer2: 'Wat wer bist du denn?',
			answer3: 'Tropfendes Schweinefleisch',
			rightAnswerIndex: 0
		}
	];
	
	public currentQuestion: any = this.questions[0];
	public selectedAnswerIndex: number = -1;
	
	public maxQuestionNr: number = 3;
	public validAnswerCount: number = 0;
	
	public init(): void
	{
		this.currentQuestion = this.questions[0];
		this.validAnswerCount = 0;
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
