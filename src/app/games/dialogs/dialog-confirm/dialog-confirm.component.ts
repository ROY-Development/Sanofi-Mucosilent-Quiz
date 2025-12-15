import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {SoundService} from '../../../core/services/sound.service';
import {SoundNameEnum} from '../../../shared/enums/sound-name.enum';
import {GameService as GlobalGameService} from '../../../core/services/game.service';
import {InitService} from '../../../core/services/init.service';

@Component({
	selector: 'app-dialog-confirm',
	templateUrl: './dialog-confirm.component.html',
	styleUrl: './dialog-confirm.component.scss',
	standalone: false
})
export class DialogConfirmComponent
{
	protected globalGameService = inject(GlobalGameService);
	protected initService = inject(InitService);
	private soundService = inject(SoundService);
	
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
	
	public isSafetyChecked: boolean = false;
	
	public onClickClose(isConfirmed: boolean): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		this.soundService.playSound(SoundNameEnum.modalFadeOut, true);
		this.cancelDialog.emit(isConfirmed);
	}
}
