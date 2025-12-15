import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	inject,
	Input,
	OnChanges,
	OnInit,
	Output,
	SimpleChanges,
	ViewChild
} from '@angular/core';
import {NicknameFormModel} from '../../../shared/models/nickname-form.model';
import {UtilString} from '../../../shared/utils/util-string';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {FormModel} from '../../../shared/models/form.model';
import {Observable} from 'rxjs';
import {UtilTimeout} from '../../../shared/utils/util-timeout';
import {SoundService} from '../../services/sound.service';
import {SoundNameEnum} from '../../../shared/enums/sound-name.enum';
import {GameScoreModel} from '../../../shared/models/game-score.model';
import {KeyboardInputMode} from '../../../shared/components/on-screen-keyboard/on-screen-keyboard.component';
import {InitService} from '../../services/init.service';
import {GameService} from '../../services/game.service';

@Component({
	selector: 'app-nickname-form',
	templateUrl: './nickname-form.component.html',
	styleUrls: ['./nickname-form.component.scss'],
	standalone: false
})
export class NicknameFormComponent implements OnInit, AfterViewInit, OnChanges
{
	protected initService = inject(InitService);
	protected gameService = inject(GameService);
	private soundService = inject(SoundService);
	
	@ViewChild('inputNickname') private inputNickname!: ElementRef<HTMLInputElement>;
	
	@Input({required: true}) public existingNicknames: Array<string> = [];
	@Input({required: true}) public gameScores: Array<GameScoreModel> = [];
	@Input({required: true}) public currentNickname: string = '';
	@Input({required: true}) public hasEnteredNickname: boolean = false;
	@Input() public editValue: NicknameFormModel | null = null;
	
	@Output() public readonly cancelForm = new EventEmitter<boolean>();
	@Output() public readonly submitForm = new EventEmitter<NicknameFormModel>();
	
	public focusElement: HTMLInputElement | null = null;
	public focusInputMode: KeyboardInputMode | null = null;
	public focusElementMaxLength: number = 0;
	
	public uid: string = UtilString.getRandomString(5);
	public formGroup!: FormGroup;
	public isFormChanged: boolean = false;
	public isFormSubmitted: boolean = false;
	
	public formModels: Array<FormModel> = [
		//new FormModel('nickname', 'Gas Safe Number', 'col-6', 'input', true, null, true, 50)
	];
	
	public userLogonService = {
		error: false,
		isLoading$: new Observable<boolean>(
			(observer) => {
				observer.next(false);
			}
		)
	};
	
	public get f(): Record<string, AbstractControl>
	{
		if (this.formGroup)
		{
			return this.formGroup.controls;
		}
		
		return {};
	}
	
	public ngOnInit(): void
	{
		this.formModels = FormModel.getFilledUpFormModels(this.formModels);
		const controlsConfig = this.getControlsConfig();
		
		this.formGroup = new FormGroup(controlsConfig);
		this.resetForm();
	}
	
	public ngAfterViewInit(): void
	{
		UtilTimeout.setTimeout(
			() => {
				if (
					this.initService.signalAppConfig().windowsOnScreenKeyboard &&
					this.inputNickname?.nativeElement
				)
				{
					this.inputNickname.nativeElement.inputMode = 'text';
				}
				
				this.resetForm();
				this.updateEditForm();
			}
		);
	}
	
	public ngOnChanges(changes: SimpleChanges): void
	{
		if ('editValue' in changes)
		{
			this.resetForm();
			this.updateEditForm();
		}
	}
	
	@HostListener('window:resize', [])
	public onResize(): void
	{
		// This is a hack to scroll into the input field in focus to fix mobile phone issues
		const activeElement = this.inputNickname.nativeElement;
		if (activeElement)
		{
			window.setTimeout(() => {
				activeElement.scrollIntoView({behavior: 'smooth', block: 'center'});
			}, 300);
		}
	}
	
	public onFocusIn(event: FocusEvent, inputmode: KeyboardInputMode, maxLength: number): void
	{
		//event.preventDefault();
		event.stopImmediatePropagation();
		
		if (!this.initService.signalAppConfig().windowsOnScreenKeyboard)
		{
			this.focusElement = event.target as HTMLInputElement;
			this.focusInputMode = inputmode;
			this.focusElementMaxLength = maxLength;
		}
		
		// This is a hack to scroll into the input field in focus to fix mobile phone issues
		const activeElement = this.inputNickname.nativeElement;
		if (activeElement)
		{
			window.setTimeout(() => {
				activeElement.scrollIntoView({behavior: 'smooth', block: 'center'});
			}, 300);
		}
	}
	
	public onBlurElement(): void
	{
		if (!this.focusElement)
		{
			return;
		}
		
		this.focusElement = null;
		this.focusInputMode = null;
		this.focusElementMaxLength = 0;
	}
	
	public onChangeFormInput(): void
	{
		this.isFormChanged = true;
		this.f.nickname?.patchValue(updateInputNickname(this.f.nickname.value, 17));
		
		function updateInputNickname(text: string, maxLength: number): string
		{
			if (text.length > maxLength) // max length check
			{
				return text.slice(0, maxLength);
			}
			
			const reg = /[^\w\s!§$%&=?¿.\-_+#*~°^ßáàâäãéèêëíìîïóòôöõúùûüçñÁÃÄÉÍÑÓÚÜËÏÖŸÿÕÂÊÎÔÛÀÈÌÒÙÇ¡«»åÅæÆœŒðÐøØ]+/g;
			// shorthand character class that matches all non-digits
			text = text.replace(reg, '');
			
			return text;
		}
	}
	
	public getControlsConfig(): any
	{
		let controlsConfig = {
			nickname: new FormControl('', [
				Validators.required,
				Validators.minLength(2),
				Validators.maxLength(17)
				//	this.validatorExists()
			])
		};
		
		controlsConfig = Object.assign(controlsConfig, FormModel.getControlsConfig(this.formModels));
		
		return controlsConfig;
	}
	
	public onSubmitForm(): void
	{
		this.isFormSubmitted = true;
		
		// console.log(this.f);
		this.soundService.playSound(SoundNameEnum.click, true);
		
		if (this.formGroup.invalid)
		{
			return;
		}
		
		const nickname = (this.f.nickname.value ?? '').trim();
		
		const formModel = new NicknameFormModel(nickname);
		
		this.currentNickname = nickname;
		
		this.submitForm.next(formModel);
	}
	
	public onClickCancel(): void
	{
		this.resetForm();
		this.soundService.playSound(SoundNameEnum.click, true);
		
		this.cancelForm.emit(false);
	}
	
	public resetForm(): void
	{
		this.isFormSubmitted = false;
		
		if (this.formGroup)
		{
			this.formGroup.reset();
		}
	}
	
	private updateEditForm(): void
	{
		if (!this.editValue)
		{
			return;
		}
		
		this.f.nickname?.patchValue(this.editValue.nickname);
		
		this.onChangeFormInput();
	}
	
	/*private validatorExists(): ValidatorFn
	{
		return (control: AbstractControl): ValidationErrors | null => {
			const invalidObj: any = {validExists: true};
			if (!control.value)
			{
				return null;
			}
			
			const testValue = control.value.trim().toLowerCase();
			if (!this.existingNicknames.includes(testValue))
			{
				return null;
			}
			// if user is reusing his nickname from game scores then should be no warning
			
				const gameScore = this.gameScores.find((value) => {
					if (
						//parseInt(value.gsNumber, 10) === parseInt(this.currentGsNumber, 10) &&
						testValue === value.nickname.toLowerCase()
					)
					{
						return value;
					}
					return null;
				}) ?? null;
				
				if (gameScore)
				{
					return null;
				}
			
			return invalidObj;
		}
	}*/
}