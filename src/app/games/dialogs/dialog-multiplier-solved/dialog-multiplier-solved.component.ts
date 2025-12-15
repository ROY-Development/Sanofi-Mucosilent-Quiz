import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {NativeTranslateService} from '../../../core/services/native-translate.service';
import {SoundService} from '../../../core/services/sound.service';
import {SoundNameEnum} from '../../../shared/enums/sound-name.enum';
import {GameService as GlobalGameService} from '../../../core/services/game.service';
import {InitService} from '../../../core/services/init.service';
import {AppConfig} from '../../../app.config';

@Component({
	selector: 'app-dialog-multiplier-solved',
	standalone: false,
	
	templateUrl: './dialog-multiplier-solved.component.html',
	styleUrl: './dialog-multiplier-solved.component.scss'
})
export class DialogMultiplierSolvedComponent
{
	protected globalGameService = inject(GlobalGameService);
	protected initService = inject(InitService);
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
	
	protected readonly AppConfig = AppConfig;
	
	protected readonly onScoreArrive = (): void => {
		this.soundService.playSound(SoundNameEnum.scoreArrive, true);
	};
	
	public onClickClose(isConfirmed: boolean): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		this.soundService.playSound(SoundNameEnum.modalFadeOut, true);
		this.cancelDialog.emit(isConfirmed);
	}
}