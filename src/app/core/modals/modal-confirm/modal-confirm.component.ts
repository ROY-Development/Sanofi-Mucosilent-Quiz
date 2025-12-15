import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {SoundService} from '../../services/sound.service';
import {SoundNameEnum} from '../../../shared/enums/sound-name.enum';

@Component({
	selector: 'app-modal-confirm',
	templateUrl: './modal-confirm.component.html',
	styleUrls: ['./modal-confirm.component.scss'],
	standalone: false
})
export class ModalConfirmComponent
{
	private soundService = inject(SoundService);
	
	@Input() public title: string | null = null;
	@Input() public titleKey: string | null = null;
	@Input() public content: string | null = null;
	@Input() public contentKey: string | null = null;
	@Input() public isJsonContent: boolean = false;
	@Input() public hasSafetyCheck: boolean = false;
	
	@Output() public readonly cancelDialog = new EventEmitter<boolean>();
	
	public isSafetyChecked: boolean = false;
	
	public onClickClose(isConfirmed: boolean): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		this.cancelDialog.emit(isConfirmed);
	}
}
