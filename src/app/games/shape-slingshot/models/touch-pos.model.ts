import {Point2DInterface} from '../../interfaces/point-2D.interface';

export class TouchPosModel
{
	constructor(
		public identifier: number,
		public pos: Point2DInterface
	)
	{
	}
}