export class TargetRectModel
{
	public halfWidth: number;
	public halfHeight: number;
	public angle: number;
	public angleDegrees: number = 0;
	public zIndex: number = 0;
	
	// behavior
	public text: string | undefined = undefined;
	public textKey: string | undefined = undefined;
	
	constructor(
		public id: string,
		public x: number,
		public y: number,
		public width: number,
		public height: number,
		public initialAngle: number
	)
	{
		this.halfWidth = width * 0.5;
		this.halfHeight = height * 0.5;
		this.angle = initialAngle;
	}
	
	public update(): void
	{
		//
	}
}