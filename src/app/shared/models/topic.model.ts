import {SplitScreenAnimationTypeEnum} from '../enums/split-screen-animation-type.enum';

export class TopicModel
{
	public categorySplitScreenConfig: {
		backgroundColor: string,
		animationType: SplitScreenAnimationTypeEnum,
		backgroundImageUrl: string | null
	} | null = null;
	
	constructor(
		public id: number,
		public name: string,
		public url: string,
		public basePath: string
	)
	{
	}
}