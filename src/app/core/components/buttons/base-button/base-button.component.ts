import {
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	Input,
	OnChanges,
	Output,
	signal,
	SimpleChanges,
	ViewChild
} from '@angular/core';
import {PipesModule} from '../../../../shared/pipes/pipes.module';
import {DirectivesModule} from '../../../../shared/directives/directives.module';
import {ConfigButtonModel} from '../../../../shared/models/config/config-button.model';
import {UtilColor} from '../../../../shared/utils/util-color';
import {AppConfig} from '../../../../app.config';
import {UtilTimeout} from '../../../../shared/utils/util-timeout';

@Component({
	selector: 'app-base-button',
	standalone: true,
	imports: [
		PipesModule,
		DirectivesModule
	],
	templateUrl: './base-button.component.html',
	styleUrl: './base-button.component.scss'
})
export class BaseButtonComponent implements OnChanges
{
	@ViewChild('btn') protected btn!: ElementRef<HTMLButtonElement>;
	
	@Input({required: true}) public configBtn: ConfigButtonModel | null = null;
	@Input({required: false}) public btnType: string = 'button';
	@Input({required: false}) public backgroundImageUrl: string = 'none';
	@Input({required: false}) public btnWidth: string = 'auto';
	@Input({required: false}) public btnHeight: string = 'auto';
	@Input({required: false}) public btnRadius: string | null = null;
	@Input({required: false}) public btnContentWidth: string = '100%';
	@Input({required: false}) public btnContentHeight: string = 'auto';
	@Input({required: false}) public btnContentPadding: string = '0 0';
	@Input({required: false}) public btnContentFontSize: string = '1em';
	@Input({required: false}) public btnDisabled: boolean = false;
	@Input({required: false}) public btnPointerEventsNone: boolean = false;
	@Input({required: false}) public btnTouchDownClass: string | undefined = undefined;
	
	@Output() public readonly clickButton = new EventEmitter<void>();
	
	public readonly signalBoxShadow = signal<string>('none');
	
	protected readonly AppConfig = AppConfig;
	
	protected getBoxShadowWithColor(baseRadius: number, color: string): string
	{
		const px = (n: number) => `${(n / 10) * baseRadius}px`;
		const {r, g, b} = UtilColor.getRGBAPartsOfColor(color);
		
		return `
    0 -${px(10)} ${px(20)} ${px(20)} rgba(${r}, ${g}, ${b}, ${0.25}) inset,
    0 -${px(5)} ${px(15)} ${px(10)} rgba(${r}, ${g}, ${b}, ${0.31}) inset,
    0 -${px(2)} ${px(5)} rgba(${r}, ${g}, ${b}, ${0.50}) inset,
    0 -${px(3)} ${px(2)} rgba(${r}, ${g}, ${b}, ${0.73}) inset,
    0 ${px(2)} 0px rgba(${r}, ${g}, ${b}, ${1.0}),
    0 ${px(2)} ${px(3)} rgba(${r}, ${g}, ${b}, ${1.0}),
    0 ${px(5)} ${px(5)} rgba(${r}, ${g}, ${b}, ${0.56}),
    0 ${px(10)} ${px(15)} rgba(${r}, ${g}, ${b}, ${0.38}),
    0 ${px(10)} ${px(20)} ${px(20)} rgba(${r}, ${g}, ${b}, ${0.25})
  `;
	}
	
	public ngOnChanges(changes: SimpleChanges): void
	{
		if (changes.configBtn)
		{
			this.updateBoxShadow();
		}
	}
	
	@HostListener('window:resize', [])
	public onResize(): void
	{
		// this recognizes the resize event and rerender the button
		this.updateBoxShadow();
	}
	
	public updateBoxShadow(): void
	{
		this.signalBoxShadow.set(
			this.getBoxShadowWithColor(
				this.configBtn?.glowRadius ?? 1,
				this.configBtn?.glowColor ?? '#ffffffaa'
			)
		);
	}
	
	/* needed only for touch devices to get it working with the touch up event */
	protected onTouchEnd(event: TouchEvent)
	{
		if (event)
		{
			//
		}
		
		UtilTimeout.setTimeout(() => {
			this.btn.nativeElement.blur();
		}, 50);
	}
}
