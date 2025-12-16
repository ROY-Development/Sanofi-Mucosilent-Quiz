export class GameQuestionAnswerModel {
	constructor(
		public answer: string,
		public scratchFactor: number = 0,
		public isCorrect: boolean = false
	)
	{
	
	}
	
	public init(): void
	{
		this.scratchFactor = 0;
		this.isCorrect = false;
	}
}