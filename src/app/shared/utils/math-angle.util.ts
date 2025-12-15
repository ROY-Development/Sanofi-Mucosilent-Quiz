export class MathAngleUtil
{
	public static radiansToDegrees(radians: number): number
	{
		return radians * 180 / Math.PI;
	}
	
	public static normalizeAngle(angle: number): number
	{
		while (angle > Math.PI)
		{
			angle -= 2 * Math.PI;
		}
		while (angle < -Math.PI)
		{
			angle += 2 * Math.PI;
		}
		
		return angle;
	}
}