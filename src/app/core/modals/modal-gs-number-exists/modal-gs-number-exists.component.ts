import {Component, EventEmitter, inject, Output} from '@angular/core';
import {SoundService} from '../../services/sound.service';
import {SoundNameEnum} from '../../../shared/enums/sound-name.enum';

@Component({
	selector: 'app-modal-gs-number-exists',
	templateUrl: './modal-gs-number-exists.component.html',
	styleUrls: ['./modal-gs-number-exists.component.scss'],
	standalone: false
})
export class ModalGsNumberExistsComponent
{
	private soundService = inject(SoundService);
	
	@Output() public readonly cancelDialog = new EventEmitter<boolean>();
	
	public onClickClose(isConfirmed: boolean): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		this.cancelDialog.emit(isConfirmed);
	}
}
