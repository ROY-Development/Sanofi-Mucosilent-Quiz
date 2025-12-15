import {ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {SoundNameEnum} from '../../shared/enums/sound-name.enum';
import {AppRoutesEnum} from '../../app-routes.enum';
import {InitService} from '../../core/services/init.service';
import {SoundService} from '../../core/services/sound.service';
import {UntilDestroy} from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
	selector: 'app-idle-page',
	templateUrl: './idle-page.component.html',
	styleUrl: './idle-page.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: false
})
export class IdlePageComponent implements OnInit, OnDestroy
{
	protected initService = inject(InitService);
	private soundService = inject(SoundService);
	
	public isDebug: boolean = false;
	
	public ngOnInit(): void
	{
	
	}
	
	public ngOnDestroy(): void
	{
	
	}
	
	public onClickBase(): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		this.initService.navigateToRoute(AppRoutesEnum.base).then();
	}
	
	public onClickStartGame(): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		this.initService.navigateToRoute(AppRoutesEnum.game).then();
	}
}
