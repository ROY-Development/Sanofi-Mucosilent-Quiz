export class UtilNumber
{
	constructor()
	{
	}
	
	public static getRandomBetween(min: number, max: number): number
	{
		return Math.floor(
			Math.random() * (max - min) + min
		)
	}
}
