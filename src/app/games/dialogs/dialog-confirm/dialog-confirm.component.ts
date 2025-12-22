import {AfterViewInit, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal} from '@angular/core';
import {SoundService} from '../../../core/services/sound.service';
import {SoundNameEnum} from '../../../shared/enums/sound-name.enum';
import {GameService as GlobalGameService} from '../../../core/services/game.service';
import {InitService} from '../../../core/services/init.service';
import {Subscription} from 'rxjs';
import {ImageLoadService} from '../../../core/services/image-load.service';

@Component({
	selector: 'app-dialog-confirm',
	templateUrl: './dialog-confirm.component.html',
	styleUrl: './dialog-confirm.component.scss',
	standalone: false
})
export class DialogConfirmComponent implements OnInit, AfterViewInit, OnDestroy
{
	protected globalGameService = inject(GlobalGameService);
	protected initService = inject(InitService);
	private soundService = inject(SoundService);
	private imageLoadService = inject(ImageLoadService);
	
	@Input() public title: string | null = null;
	@Input() public titleKey: string | null = null;
	@Input() public content: string | null = null;
	@Input() public contentKey: string | null = null;
	@Input() public contentYes: string | null = null;
	@Input() public contentYesKey: string | null = null;
	@Input() public contentNo: string | null = null;
	@Input() public contentNoKey: string | null = null;
	@Input() public isJsonContent: boolean = false;
	@Input() public hasSafetyCheck: boolean = false;
	
	@Output() public readonly cancelDialog = new EventEmitter<boolean>();
	
	protected readonly signalBtnBgImageUrl = signal<string>('none');
	
	public isSafetyChecked: boolean = false;
	
	private addImageSubscription: Subscription | null = null;
	
	public ngOnInit(): void
	{
		this.addImageSubscription = this.imageLoadService.addImageEmitter.subscribe((id: string) => {
			if (
				id === 'productBtnBgImage'
			)
			{
				this.getImages();
			}
		});
	}
	
	public ngAfterViewInit(): void
	{
		this.getImages();
	}
	
	public ngOnDestroy(): void
	{
		if (this.addImageSubscription)
		{
			this.addImageSubscription.unsubscribe();
			this.addImageSubscription = null;
		}
	}
	
	public onClickClose(isConfirmed: boolean): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		this.soundService.playSound(SoundNameEnum.modalFadeOut, true);
		this.cancelDialog.emit(isConfirmed);
	}
	
	private getImages(): void
	{
		const image: HTMLImageElement | null = this.imageLoadService.getImage('productBtnBgImage');
		if (image)
		{
			this.signalBtnBgImageUrl.set(`url('${image.src}')`);
		}
	}
}
