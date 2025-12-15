import {Component, inject, Input, OnChanges, signal, SimpleChanges} from '@angular/core';
import {SoundService} from '../../../core/services/sound.service';

@Component({
	selector: 'app-button-sound-on-off',
	templateUrl: './button-sound-on-off.component.html',
	styleUrl: './button-sound-on-off.component.scss',
	standalone: false
})
export class ButtonSoundOnOffComponent implements OnChanges
{
	protected soundService = inject(SoundService);
	
	@Input({required: false}) public imageBackgroundUrl: string = 'none';
	@Input({required: false}) public imageSoundOnUrl: string = 'none';
	@Input({required: false}) public imageSoundOffUrl: string = 'none';
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
	
	protected readonly signalButtonSoundUrl = signal<string>('none');
	
	protected readonly document = document;
	
	public ngOnChanges(changes: SimpleChanges): void
	{
		if (
			'imageSoundOnUrl' in changes ||
			'imageSoundOffUrl' in changes
		)
		{
			this.updateImage();
		}
	}
	
	public initImages(imageSoundOnUrl: string, imageSoundOffUrl: string): void
	{
		this.imageSoundOnUrl = imageSoundOnUrl;
		this.imageSoundOffUrl = imageSoundOffUrl;
		
		this.updateImage();
	}
	
	protected onClickToggleSound(): void
	{
		this.soundService.toggleIsMuted();
		
		this.updateImage();
	}
	
	private updateImage(): void
	{
		let imageUrl: string;
		if (this.soundService.isMuted)
		{
			imageUrl = this.imageSoundOffUrl;
		}
		else
		{
			imageUrl = this.imageSoundOnUrl;
		}
		
		if (imageUrl !== 'none')
		{
			this.signalButtonSoundUrl.set(`url('${imageUrl}')`);
		}
	}
}
