import {Component, EventEmitter, inject, Input, OnInit, Output, signal} from '@angular/core';
import {PipesModule} from '../../../../shared/pipes/pipes.module';
import {SoundService} from '../../../services/sound.service';
import {SoundNameEnum} from '../../../../shared/enums/sound-name.enum';
import {GameService as GlobalGameService} from '../../../services/game.service';
import {InitService} from '../../../services/init.service';
import {ImageLoadService} from '../../../services/image-load.service';
import {NativeTranslateService} from '../../../services/native-translate.service';
import {BaseButtonComponent} from '../../buttons/base-button/base-button.component';

@Component({
	selector: 'app-dialog-legal',
	templateUrl: './dialog-legal.component.html',
	imports: [
		PipesModule,
		BaseButtonComponent
	],
	standalone: true,
	styleUrl: './dialog-legal.component.scss'
})
export class DialogLegalComponent implements OnInit
{
	protected readonly globalGameService = inject(GlobalGameService);
	protected readonly initService = inject(InitService);
	private readonly imageLoadService = inject(ImageLoadService);
	private readonly soundService = inject(SoundService);
	private readonly nativeTranslateService = inject(NativeTranslateService);
	
	@Input({required: true}) public type!: 'imprint' | 'privacy-policy' | 'crm-info';
	
	@Output() public readonly cancelDialog = new EventEmitter<boolean>();
	
	protected readonly signalBtnCloseImageUrl = signal<string>('none');
	protected readonly signalTitle = signal<string>('');
	protected readonly signalContent = signal<string>('');
	
	public ngOnInit(): void
	{
		const image: HTMLImageElement | null = this.imageLoadService.getImage('btnClose');
		if (image)
		{
			this.signalBtnCloseImageUrl.set(`url('${image.src}')`);
		}
		
		if (this.type === 'crm-info')
		{
			this.signalTitle.set(this.nativeTranslateService.instant('what-this-data-is-for'));
			this.signalContent.set(this.nativeTranslateService.instant('collect-information-text'));
		}
		else
		{
			this.signalTitle.set(this.nativeTranslateService.instant(this.type));
			this.signalContent.set(this.nativeTranslateService.instant(this.type + '-text'));
		}
	}
	
	public onClickClose(isConfirmed: boolean): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		this.cancelDialog.emit(isConfirmed);
	}
}
