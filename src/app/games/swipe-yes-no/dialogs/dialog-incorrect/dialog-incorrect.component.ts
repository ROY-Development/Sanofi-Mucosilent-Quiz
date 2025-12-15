import {Component, EventEmitter, inject, Input, Output, signal} from '@angular/core';
import {GameStateEnum} from '../../enums/game-state.enum';
import {QuestionCardModel} from '../../models/question-card.model';
import {UtilTimeout} from '../../../../shared/utils/util-timeout';
import {InitService} from '../../../../core/services/init.service';
import {GameService as GlobalGameService} from '../../../../core/services/game.service';

@Component({
	selector: 'app-dialog-incorrect',
	templateUrl: './dialog-incorrect.component.html',
	styleUrl: './dialog-incorrect.component.scss',
	standalone: false
})
export class DialogIncorrectComponent
{
	protected initService = inject(InitService);
	protected globalGameService = inject(GlobalGameService);
	
	@Input({required: true}) public gameState: GameStateEnum = GameStateEnum.init;
	@Input({required: true}) public currentQuestion: QuestionCardModel | null = null;
	
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
