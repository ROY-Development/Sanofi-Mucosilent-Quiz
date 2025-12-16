import {GameQuestionAnswerModel} from './game-question-answer.model';

export class GameQuestionModel {
	constructor(
		public question: string,
		public answers: Array<GameQuestionAnswerModel>,
		public rightAnswerIndex: number
	)
	{
	
	}
}