import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	inject,
	OnDestroy,
	OnInit,
	ViewChild
} from '@angular/core';
import {InitService} from '../../services/init.service';
import {UserGameService} from '../../services/user-game.service';
import {SoundService} from '../../services/sound.service';
import {SoundNameEnum} from '../../../shared/enums/sound-name.enum';
import {AppConfig} from '../../../app.config';
import {UntilDestroy} from '@ngneat/until-destroy';
import {GameHeaderService} from '../../services/game-header.service';
import {Subscription} from 'rxjs';
import {ImageLoadService} from '../../services/image-load.service';
import {GameService} from '../../services/game.service';
import {ButtonSoundOnOffComponent} from '../../../shared/components/button-sound-on-off/button-sound-on-off.component';
import {ButtonFullscreenComponent} from '../../../shared/components/button-fullscreen/button-fullscreen.component';

@UntilDestroy()
@Component({
	selector: 'app-game-header',
	templateUrl: './game-header.component.html',
	styleUrls: ['./game-header.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default,
	standalone: false
})
export class GameHeaderComponent implements OnInit, AfterViewInit, OnDestroy
{
	protected gameService = inject(GameService);
	protected userGameService = inject(UserGameService);
	protected gameHeaderService = inject(GameHeaderService);
	protected initService = inject(InitService);
	protected soundService = inject(SoundService);
	private imageLoadService = inject(ImageLoadService);
	
	@ViewChild("buttonSoundOnOffComponent") buttonSoundOnOffComponent!: ButtonSoundOnOffComponent;
	@ViewChild("buttonFullscreenComponent") buttonFullscreenComponent!: ButtonFullscreenComponent;
	@ViewChild('coinImage') public coinImage!: ElementRef<HTMLDivElement>;
	@ViewChild('score') public scoreRef!: ElementRef<HTMLDivElement>;
	
	//private readonly appLoopService: AppLoopService = new AppLoopService(this.loop.bind(this));
	protected readonly SoundNameEnum = SoundNameEnum;
	protected readonly AppConfig = AppConfig;
	
	public frontImageUrl: string = 'none';
	public backImageUrl: string = 'none';
	
	private onUpdateGameScoreSubscription: Subscription | null = null;
	private addImageSubscription: Subscription | null = null;
	
	public ngOnInit(): void
	{
		this.onUpdateGameScoreSubscription = this.gameHeaderService.onUpdateGameScore
			.subscribe(() => {
				this.gameHeaderService.callScoreTween(this.scoreRef, () => {
					this.gameHeaderService.callScoreIconTween(this.coinImage, null);
				});
			});
		
		this.addImageSubscription = this.imageLoadService.addImageEmitter.subscribe((id: string) => {
			if (
				id === 'btnSoundOn' ||
				id === 'btnSoundOff' ||
				id === 'btnFullscreenOn' ||
				id === 'btnFullscreenOff'
			)
			{
				this.getImages();
			}
		});
	}
	
	public ngAfterViewInit(): void
	{
		this.getImages();
		this.gameHeaderService.init(this.scoreRef);
	}
	
	public ngOnDestroy(): void
	{
		if (this.onUpdateGameScoreSubscription)
		{
			this.onUpdateGameScoreSubscription.unsubscribe();
			this.onUpdateGameScoreSubscription = null;
		}
		
		if (this.addImageSubscription)
		{
			this.addImageSubscription.unsubscribe();
			this.addImageSubscription = null;
		}
	}
	
	public init(): void
	{
		let image: HTMLImageElement | null;
		
		image = this.imageLoadService.getImage('crabFrontImage');
		if (image)
		{
			this.frontImageUrl = `url('${image.src}')`;
		}
		
		image = this.imageLoadService.getImage('crabBackImage');
		if (image)
		{
			this.backImageUrl = `url('${image.src}')`;
		}
	}
	
	public onClickEndGame(): void
	{
		this.soundService.playSound(SoundNameEnum.click, true);
		
		/*let loopIsRunning: boolean = this.appLoopService.isRunning;
		if (loopIsRunning)
		{
			this.appLoopService.stop(); // pause (stop) loop
		}*/
		
		/*this.modalService.openModalDialog(
			ModalConfirmComponent,
			(isConfirmed: boolean) => {
				if (isConfirmed)
				{
					//loopIsRunning = false; // important for on hidden callback otherwise it is looping again
					this.gameService.setIsGameRunning(false);
					this.initService.navigateToRoute(AppRoutesEnum.start).then();
				}
			},
			ModalSizeEnum.fixed,
			'800px', null,
			true, {
				title: 'End Game?',
				content: 'Do you want to end the game?\n' +
					'Remember you have to finish all 5 rounds of the game to collect the CUPRA score. But feel free to come back later and try again.',
				isJsonContent: false,
				hasSafetyCheck: false
			}, '', true, true,
			() => {
				//if (loopIsRunning)
				{
				//	this.appLoopService.start(this.appLoopService.signalRuntime()); // restart loop if it was running before
				}
			}
		);*/
	}
	
	private getImages(): void
	{
		const imageSoundOnUrl: HTMLImageElement | null = this.imageLoadService.getImage('btnSoundOn');
		const imageSoundOffUrl: HTMLImageElement | null = this.imageLoadService.getImage('btnSoundOff');
		const imageFullscreenOn: HTMLImageElement | null = this.imageLoadService.getImage('btnFullscreenOn');
		const imageFullscreenOff: HTMLImageElement | null = this.imageLoadService.getImage('btnFullscreenOff');
		
		if (imageSoundOnUrl && imageSoundOffUrl && imageFullscreenOn && imageFullscreenOff)
		{
			this.buttonFullscreenComponent?.initImages(imageFullscreenOn.src, imageFullscreenOff.src);
			this.buttonSoundOnOffComponent?.initImages(imageSoundOnUrl.src, imageSoundOffUrl.src);
		}
	}
}
