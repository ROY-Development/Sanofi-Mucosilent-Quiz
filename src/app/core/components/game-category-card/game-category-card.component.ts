import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {TopicModel} from '../../../shared/models/topic.model';
import {InitService} from '../../services/init.service';
import {GameService} from '../../services/game.service';

@Component({
	selector: 'app-game-category-card',
	standalone: false,
	templateUrl: './game-category-card.component.html',
	styleUrl: './game-category-card.component.scss'
})
export class GameCategoryCardComponent
{
	protected initService = inject(InitService);
	protected gameService = inject(GameService);
	
	@Input({required: true}) public nr!: number;
	@Input({required: true}) public topic!: TopicModel;
	@Input({required: true}) public hasTransition!: boolean;
	@Input({required: true}) public selected!: boolean;
	@Input({required: true}) public notSelected!: boolean;
	@Input({required: false}) public btnPointerEventsNone: boolean = false;
	
	@Output() protected readonly clickTopic = new EventEmitter<TopicModel>();
}
