import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {SoundService} from '../../services/sound.service';
import {SoundNameEnum} from '../../../shared/enums/sound-name.enum';
import {NativeTranslateService} from '../../services/native-translate.service';

@Component({
	selector: 'app-modal-game-multiplier-solved',
	templateUrl: './modal-game-multiplier-solved.component.html',
	styleUrls: ['./modal-game-multiplier-solved.component.scss'],
	standalone: false
})
export class ModalGameMultiplierSolvedComponent
{
	protected nativeTranslateService = inject(NativeTranslateService);
	private soundService = inject(SoundService);
	
	@Input({required: true}) public quizNumber: number = 0;
	@Input({required: true}) public score: number = 0;
	@Input({required: true}) public wasLastGame: boolean = false;
	@Input({required: true}) public finishBallScores: Array<{
		factor: number,
		scoreBefore: number,
		scoreAfter: number
	}> = [];
	
	@Output() public readonly cancelDialog = new EventEmitter<boolean>();
	
	public onClickClose(isConfirmed: boolean): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		this.cancelDialog.emit(isConfirmed);
	}
}
