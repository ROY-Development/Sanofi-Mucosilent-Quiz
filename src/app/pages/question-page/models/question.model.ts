export class QuestionModel
{
	constructor(
		public question: string,
		public answer1: string,
		public answer2: string,
		public answer3: string,
		public rightAnswerIndex: boolean
	)
	{
	}
}