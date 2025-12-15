import {Component, EventEmitter, inject, Input, Output, signal} from '@angular/core';
import {GameStateEnum} from '../../enums/game-state.enum';
import {QuestionModel} from '../../models/question.model';
import {UtilTimeout} from '../../../../shared/utils/util-timeout';
import {InitService} from '../../../../core/services/init.service';
import {GameService as GlobalGameService} from '../../../../core/services/game.service';

@Component({
	selector: 'app-dialog-result',
	templateUrl: './dialog-result.component.html',
	styleUrl: './dialog-result.component.scss',
	standalone: false
})
export class DialogResultComponent
{
	protected initService = inject(InitService);
	protected globalGameService = inject(GlobalGameService);
	
	@Input({required: true}) public gameState: GameStateEnum = GameStateEnum.init;
	@Input({required: true}) public currentQuestion: QuestionModel | null = null;
	
	@Output() public readonly cancelDialog = new EventEmitter<void>();
	
	public readonly signalShakeDialog = signal<boolean>(false);
	
	protected readonly GameStateEnum = GameStateEnum;
	
	public shake(): void
	{
		if (this.gameState === GameStateEnum.incorrect)
		{
			this.signalShakeDialog.set(true);
			UtilTimeout.setTimeout(() => {
				this.signalShakeDialog.set(false);
			}, 250);
		}
	}
}
