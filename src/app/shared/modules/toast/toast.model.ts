export class ToastModel
{
	public top: number = 0;
	public right: number = 0;
	
	constructor(
		public message: string,
		public type: 'info' | 'success' | 'warning' | 'error',
		public duration: number
	)
	{
	}
}