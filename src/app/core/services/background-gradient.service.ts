import {Injectable, signal} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class BackgroundGradientService
{
	public readonly signalColors = signal<Array<string>>([]);
	public readonly signalBackgroundImageUrl = signal<string>('none');
	public readonly signalBackgroundColorsDuration = signal<number>(25);
	
	private initBackgroundColorsDuration: number = 25;
	private initColors: Array<string> = [
		"#ee775288",
		"#e73c7e88",
		"#23a6d588",
		"#23d5ab88"
	];
	
	public init(initColors: Array<string>, initBackgroundColrsDuration: number): void
	{
		this.initColors = initColors;
		this.initBackgroundColorsDuration = initBackgroundColrsDuration;
		this.update();
	}
	
	public update(): void
	{
		this.signalColors.set([...this.initColors]);
		const str: string = `linear-gradient(-45deg, ${this.signalColors().join(',')})`;
		this.signalBackgroundImageUrl.set(str);
		this.signalBackgroundColorsDuration.set(this.initBackgroundColorsDuration);
	}
	
	public setBackgroundColors(colors: Array<string>): void
	{
		this.signalColors.set(colors);
		if (colors.length > 0)
		{
			const str: string = `linear-gradient(-45deg, ${colors.join(',')})`;
			this.signalBackgroundImageUrl.set(str);
		}
	}
	
	public updateRoute(url: string): void
	{
		if (url)
		{
			//
		}
		this.update();
	}
}
