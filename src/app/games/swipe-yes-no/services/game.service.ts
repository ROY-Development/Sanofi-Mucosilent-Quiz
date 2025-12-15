import {Point2DInterface} from '../../interfaces/point-2D.interface';
import {MathAngleUtil} from '../../../shared/utils/math-angle.util';
import {Line2DInterface} from '../../interfaces/line-2D.interface';

export class GameService
{
	public getCenterPoint(point1: Point2DInterface, point2: Point2DInterface): Point2DInterface
	{
		const centerX = (point1.x + point2.x) * 0.5;
		const centerY = (point1.y + point2.y) * 0.5;
		return {x: centerX, y: centerY};
	}
	
	public rotatePoint(point: Point2DInterface, angle: number): Point2DInterface
	{
		if (!point)
		{
			return point;
		}
		
		const radians = angle * Math.PI / 180;
		const cos = Math.cos(radians);
		const sin = Math.sin(radians);
		return {
			x: cos * point.x + sin * point.y,
			y: -sin * point.x + cos * point.y
		};
	}
	
	public getRotationRadianAngle(point1: Point2DInterface, point2: Point2DInterface): number
	{
		const dx = point2.x - point1.x;
		const dy = point2.y - point1.y;
		return Math.atan2(dy, dx);
	}
	
	public getRotationDegreesAngle(point1: Point2DInterface, point2: Point2DInterface): number
	{
		const radianAngle = this.getRotationRadianAngle(point1, point2);
		return MathAngleUtil.radiansToDegrees(radianAngle);
	}
	
	public getDistance(point1: Point2DInterface, point2: Point2DInterface): number
	{
		const dx = point2.x - point1.x;
		const dy = point2.y - point1.y;
		return Math.sqrt(dx * dx + dy * dy);
	}
	
	public checkPointInRectCollision(point: Point2DInterface, rect: {
		x: number,
		y: number,
		width: number,
		height: number,
		angle: number
	}): boolean
	{
		// calculate the corners of the rectangle
		const corners: Array<Point2DInterface> = this.getRectCorners(rect);
		
		// check if the point is inside the rotated rectangle
		let isInside: boolean = false;
		for (let i = 0, j = corners.length - 1; i < corners.length; j = i++)
		{
			const xi = corners[i].x, yi = corners[i].y;
			const xj = corners[j].x, yj = corners[j].y;
			const isIntersecting = ((yi > point.y) != (yj > point.y))
				&& (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
			if (isIntersecting)
			{
				isInside = !isInside;
			}
		}
		return isInside;
	}
	
	public checkRectInLineCollision(
		rect: {
			x: number,
			y: number,
			width: number,
			height: number,
			angle: number
		},
		line: Line2DInterface
	): boolean
	{
		// calculate the corners of the rectangle
		const corners: Array<Point2DInterface> = this.getRectCorners(rect);
		
		// check that the line intersects the edges of the rotated rectangle
		for (let i: number = 0, j: number = corners.length - 1; i < corners.length; j = i++)
		{
			const line2: Line2DInterface = {
				point1: {x: corners[i].x, y: corners[i].y},
				point2: {x: corners[j].x, y: corners[j].y}
			};
			if (this.checkLineIntersection(line, line2))
			{
				return true;
			}
		}
		return false;
	}
	
	public checkLineIntersection(
		line1: Line2DInterface,
		line2: Line2DInterface
	)
	{
		// calculate the intersections
		const denominator = (line2.point2.y - line2.point1.y) * (line1.point2.x - line1.point1.x) -
			(line2.point2.x - line2.point1.x) * (line1.point2.y - line1.point1.y);
		if (denominator == 0)
		{
			return false;
		}
		const ua = ((line2.point2.x - line2.point1.x) * (line1.point1.y - line2.point1.y) -
			(line2.point2.y - line2.point1.y) * (line1.point1.x - line2.point1.x)) / denominator;
		const ub = ((line1.point2.x - line1.point1.x) * (line1.point1.y - line2.point1.y) -
			(line1.point2.y - line1.point1.y) * (line1.point1.x - line2.point1.x)) / denominator;
		// check that the intersection points are within the boundaries of the lines
		return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
	}
	
	/*
	calculate the min, max values on the coordinate system
	 */
	public getRectMinMaxCorners(rect: {
		x: number,
		y: number,
		width: number,
		height: number,
		angle: number
	})
	{
		const rectCorners = this.getRectCorners(rect);
		let minCornerX: number = Number.MAX_VALUE;
		let maxCornerX: number = Number.MIN_VALUE;
		let minCornerY: number = Number.MAX_VALUE;
		let maxCornerY: number = Number.MIN_VALUE;
		for (const corner of rectCorners)
		{
			minCornerX = Math.min(minCornerX, corner.x);
			maxCornerX = Math.max(maxCornerX, corner.x);
			minCornerY = Math.min(minCornerY, corner.y);
			maxCornerY = Math.max(maxCornerY, corner.y);
		}
		
		return {
			minCornerX: minCornerX,
			maxCornerX: maxCornerX,
			minCornerY: minCornerY,
			maxCornerY: maxCornerY
		};
	}
	
	public getRectCorners(rect: {
		x: number,
		y: number,
		width: number,
		height: number,
		angle: number
	}): Array<Point2DInterface>
	{
		const centerX: number = rect.x + rect.width * 0.5;
		const centerY: number = rect.y + rect.height * 0.5;
		
		const corners: Array<Point2DInterface> = [
			{x: rect.x, y: rect.y},
			{x: rect.x + rect.width, y: rect.y},
			{x: rect.x + rect.width, y: rect.y + rect.height},
			{x: rect.x, y: rect.y + rect.height}
		];
		for (const corner of corners)
		{
			const dx: number = corner.x - centerX;
			const dy: number = corner.y - centerY;
			corner.x = centerX + dx * Math.cos(rect.angle) - dy * Math.sin(rect.angle);
			corner.y = centerY + dx * Math.sin(rect.angle) + dy * Math.cos(rect.angle);
		}
		return corners;
	}
}