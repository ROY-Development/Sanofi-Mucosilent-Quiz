import {LanguageEnum} from '../enums/language.enum';
import {AppConfig} from '../../app.config';
import {FormControl, FormGroup, Validators} from '@angular/forms';

export class FormModel
{
	public isFilledUp: boolean = false;
	public key: string;
	public language: LanguageEnum = LanguageEnum.en;
	
	constructor(
		public name: string,
		public label: string,
		public cssClass: string,
		public inputFieldType: string,
		public isRequired: boolean = false,
		public placeholder: string | null = null,
		public isEnabled: boolean = true,
		public maxLength: number = 2048
	)
	{
		this.key = name;
	}
	
	public static getFilledUpFormModels(formModels: Array<FormModel>): Array<FormModel>
	{
		if (formModels.length > 0 && formModels[0].isFilledUp)
		{
			return formModels;
		}
		
		let newFormModel: FormModel;
		const newFormModels: Array<FormModel> = [];
		
		for (const language of AppConfig.languages)
		{
			for (const formModel of formModels)
			{
				const isRequiredLanguage: boolean = AppConfig.requiredLanguages.indexOf(language) !== -1;
				
				newFormModel = new FormModel(
					formModel.name + '-' + language,
					formModel.label,
					formModel.cssClass,
					formModel.inputFieldType
				);
				newFormModel.key = formModel.name;
				newFormModel.isFilledUp = true;
				newFormModel.language = language;
				newFormModel.isRequired = isRequiredLanguage && formModel.isRequired;
				newFormModel.placeholder = formModel.placeholder ? formModel.placeholder : '';
				newFormModel.isEnabled = formModel.isEnabled;
				newFormModel.maxLength = formModel.maxLength;
				newFormModels.push(newFormModel);
			}
		}
		
		return newFormModels;
	}
	
	public static getControlsConfig(formModels: Array<FormModel>): any
	{
		const controlsConfig = {};
		
		for (const formModel of formModels)
		{
			(<any>controlsConfig)[formModel.name] = new FormControl(
				formModel.placeholder ? formModel.placeholder : '',
				formModel.isRequired ? [Validators.required] : []
			);
		}
		
		return controlsConfig;
	}
	
	public static getTextsFromForm(
		controls: FormGroup['controls'],
		formModels: Array<FormModel>,
		isGivingEmptyValues: boolean = false
	): any
	{
		const result: any = {};
		let formControl: FormControl;
		
		for (const formModel of formModels)
		{
			formControl = <FormControl>controls[formModel.name];
			
			if ((formControl.value && formControl.value.trim().length > 0) || isGivingEmptyValues)
			{
				result[formModel.name] = formControl.value ? formControl.value.trim() : '';
			}
		}
		
		return result;
	}
}