export class TopicQuestionResultModel
{
	constructor(
		public round: number,
		public score: number,
		public remainingTimeScore: number,
		public comboScore: number,
		public totalScore: number,
		public remainingTime: number,
		public isLeftCorrect: boolean,
		public isSelectedLeft: boolean | null,
		public isSelectedCorrect: boolean,
		public categoryLocalisationKey: string,
		public questionLocalisationKey: string,
		public feedbackLocalisationKey: string,
		public answerLeftLocalisationKey: string,
		public answerRightLocalisationKey: string
	)
	{
	}
	
	public isFeedbackVisible: boolean = false;
}