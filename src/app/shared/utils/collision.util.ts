export class CollisionUtil
{
	public static isCircleInRectangle(
		cx: number,
		cy: number,
		radius: number,
		rx: number,
		ry: number,
		rw: number,
		rh: number
	): boolean
	{
		// distance between ball and rect
		const distanceX = Math.abs(cx - rx - rw * 0.5);
		const distanceY = Math.abs(cy- ry - rh * 0.5);
		
		// check if distance is smaller than half of sum of widths and heights
		if (distanceX > (rw * 0.5 + radius))
		{
			return false;
		}
		if (distanceY > (rh * 0.5 + radius))
		{
			return false;
		}
		
		if (distanceX <= (rw * 0.5))
		{
			return true;
		}
		if (distanceY <= (rh * 0.5))
		{
			return true;
		}
		
		const dx = distanceX - rw * 0.5;
		const dy = distanceY - rh * 0.5;
		
		return (dx * dx + dy * dy <= (radius * radius));
	}
}