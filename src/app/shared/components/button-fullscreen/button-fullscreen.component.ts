import {Component, Input, OnChanges, signal, SimpleChanges} from '@angular/core';
import {UtilBrowser} from '../../utils/util-browser';

@Component({
	selector: 'app-button-fullscreen',
	templateUrl: './button-fullscreen.component.html',
	styleUrl: './button-fullscreen.component.scss',
	standalone: false
})
export class ButtonFullscreenComponent implements OnChanges
{
	@Input({required: false}) public imageBackgroundUrl: string = 'none';
	@Input({required: false}) public imageFullscreenOnUrl: string = 'none';
	@Input({required: false}) public imageFullscreenOffUrl: string = 'none';
	@Input({required: false}) public top: string | undefined = undefined;
	@Input({required: false}) public bottom: string | undefined = undefined;
	@Input({required: false}) public left: string | undefined = undefined;
	@Input({required: false}) public right: string | undefined = undefined;
	@Input({required: false}) public color: string = '#ffffff';
	@Input({required: false}) public backgroundColor: string = '#ffffff4d';
	@Input({required: false}) public borderRadiusPx: number | undefined = undefined;
	@Input({required: false}) public borderWidthPx: number | undefined = undefined;
	@Input({required: false}) public borderColor: string | undefined = undefined;
	@Input({required: false}) public disabled: boolean = false;
	
	protected readonly signalButtonFullscreenUrl = signal<string>('none');
	
	protected readonly document = document;
	
	public ngOnChanges(changes: SimpleChanges): void
	{
		if (
			'imageFullscreenOnUrl' in changes ||
			'imageFullscreenOffUrl' in changes
		)
		{
			this.updateImage();
		}
	}
	
	public initImages(imageFullscreenOnUrl: string, imageFullscreenOffUrl: string): void
	{
		this.imageFullscreenOnUrl = imageFullscreenOnUrl;
		this.imageFullscreenOffUrl = imageFullscreenOffUrl;
		
		this.updateImage();
	}
	
	protected onClickToggleFullscreen(): void
	{
		UtilBrowser.toggleFullscreen().then(
			() => {
				this.updateImage();
			}
		);
	}
	
	private updateImage(): void
	{
		let imageUrl: string;
		if (document.fullscreenElement)
		{
			imageUrl = this.imageFullscreenOffUrl;
		}
		else
		{
			imageUrl = this.imageFullscreenOnUrl;
		}
		
		if (imageUrl !== 'none')
		{
			this.signalButtonFullscreenUrl.set(`url('${imageUrl}')`);
		}
	}
}
