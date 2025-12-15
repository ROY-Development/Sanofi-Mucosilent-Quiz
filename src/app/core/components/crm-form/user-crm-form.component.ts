import {
	AfterViewInit,
	Component,
	EventEmitter,
	inject,
	Input,
	OnChanges,
	OnInit,
	Output,
	SimpleChanges
} from '@angular/core';
import {InitService} from '../../services/init.service';
import {GameService} from '../../services/game.service';
import {SoundService} from '../../services/sound.service';
import {KeyboardInputMode} from '../../../shared/components/on-screen-keyboard/on-screen-keyboard.component';
import {UtilString} from '../../../shared/utils/util-string';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {FormModel} from '../../../shared/models/form.model';
import {UtilTimeout} from '../../../shared/utils/util-timeout';
import {SoundNameEnum} from '../../../shared/enums/sound-name.enum';
import {UserCrmService} from '../../services/user-crm.service';
import {UtilValidation} from '../../../shared/utils/util-validation';
import {UserCrmFormModel} from '../../../shared/models/user-crm-form.model';

@Component({
	selector: 'app-user-crm-form',
	standalone: false,
	templateUrl: './user-crm-form.component.html',
	styleUrl: './user-crm-form.component.scss'
})
export class UserCrmFormComponent implements OnInit, AfterViewInit, OnChanges
{
	protected userCrmService = inject(UserCrmService);
	protected initService = inject(InitService);
	protected gameService = inject(GameService);
	private soundService = inject(SoundService);
	
	@Input() public editValue: UserCrmFormModel | null = null;
	
	@Output() public readonly cancelForm = new EventEmitter<boolean>();
	@Output() public readonly submitForm = new EventEmitter<UserCrmFormModel>();
	
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
	
	protected readonly maxLengthFirstName: number = 20;
	protected readonly maxLengthLastName: number = 20;
	protected readonly maxLengthOrganisation: number = 20;
	protected readonly maxLengthEmail: number = 40;
	protected readonly maxLengthMessage: number = 400;
	
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
		this.f.firstName?.patchValue(updateInputText(this.f.firstName.value, this.maxLengthFirstName));
		this.f.lastName?.patchValue(updateInputText(this.f.lastName.value, this.maxLengthLastName));
		this.f.organisation?.patchValue(updateInputText(this.f.organisation.value, this.maxLengthOrganisation));
		this.f.message?.patchValue(updateInputText(this.f.message.value, this.maxLengthMessage));
		
		function updateInputText(text: string | undefined, maxLength: number): string
		{
			if (!text)
			{
				return '';
			}
			
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
		let controlsConfig: any = {};
		
		if (this.gameService.signalGameConfig()?.quizConfigCrm?.isFirstNameEnabled)
		{
			controlsConfig['firstName'] = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(this.maxLengthFirstName)]);
		}
		if (this.gameService.signalGameConfig()?.quizConfigCrm?.isLastNameEnabled)
		{
			controlsConfig['lastName'] = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(this.maxLengthLastName)]);
		}
		if (this.gameService.signalGameConfig()?.quizConfigCrm?.isBirthdateEnabled)
		{
			controlsConfig['birthdate'] = new FormControl('', [Validators.required, UtilValidation.validatorDate, UtilValidation.validatorDateAtLeastXYearsOld(18)]);
		}
		if (this.gameService.signalGameConfig()?.quizConfigCrm?.isOrganisationEnabled)
		{
			controlsConfig['organisation'] = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(this.maxLengthOrganisation)]);
		}
		if (this.gameService.signalGameConfig()?.quizConfigCrm?.isEmailEnabled)
		{
			controlsConfig['email'] = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(this.maxLengthEmail), UtilValidation.validatorEmail]);
		}
		if (this.gameService.signalGameConfig()?.quizConfigCrm?.isMessageEnabled)
		{
			controlsConfig['message'] = new FormControl('', [Validators.maxLength(this.maxLengthMessage)]);
		}
		
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
		
		const firstName: string | null = this.f.firstName?.value?.length > 0 ? this.f.firstName.value.trim() : null;
		const lastName: string | null = this.f.lastName?.value?.length > 0 ? this.f.lastName.value.trim() : null;
		const birthdate: string | null = this.f.birthdate?.value?.length > 0 ? this.f.birthdate.value.trim() : null;
		const organisation: string | null = this.f.organisation?.value?.length > 0 ? this.f.organisation.value.trim() : null;
		const email: string | null = this.f.email?.value?.length > 0 ? this.f.email.value.trim() : null;
		const message: string | null = this.f.message?.value?.length > 0 ? this.f.message.value.trim() : null;
		
		const formModel = new UserCrmFormModel(
			firstName,
			lastName,
			birthdate,
			organisation,
			email,
			message
		);
		
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
		
		this.f.firstName?.patchValue(this.editValue.firstName);
		this.f.lastName?.patchValue(this.editValue.lastName);
		this.f.birthdate?.patchValue(this.editValue.birthdate);
		this.f.organisation?.patchValue(this.editValue.organisation);
		this.f.email?.patchValue(this.editValue.email);
		this.f.message?.patchValue(this.editValue.message);
		
		this.onChangeFormInput();
	}
}
