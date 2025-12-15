import {Point2DInterface} from '../../interfaces/point-2D.interface';

export class SelectedAnswerModel
{
	constructor(
		public questionId: number,
		public isLeftCorrect: boolean,
		public isSelectedLeft: boolean | null,
		public isSelectedCorrect: boolean,
		public remainingTimeFactor: number,
		public remainingTimeRank: number,
		public btnPosition: Point2DInterface,
		public comboPosition: Point2DInterface | null,
		public superfastPosition: Point2DInterface | null,
		public categoryLocalisationKey: string,
		public questionLocalisationKey: string,
		public feedbackLocalisationKey: string,
		public answerLeftLocalisationKey: string,
		public answerRightLocalisationKey: string
	)
	{
	}
}