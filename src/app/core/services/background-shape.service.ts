import {Injectable, signal} from '@angular/core';
import {BackgroundShapeModel} from '../../shared/models/background-shape.model';

@Injectable({
	providedIn: 'root'
})
export class BackgroundShapeService
{
	public readonly signalShape = signal<BackgroundShapeModel | null>(null);
	
	public init(): void
	{
		this.signalShape.set(null);
	}
	
	public setShape(shape: BackgroundShapeModel): void
	{
		this.signalShape.set(shape);
	}
	
	public updateRoute(url: string): void
	{
		if (url)
		{
			//
		}
		this.signalShape.set(null);
	}
}
