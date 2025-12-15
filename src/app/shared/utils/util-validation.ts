import {AbstractControl, FormControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {map, switchMap} from 'rxjs/operators';
import {Observable, of, timer} from 'rxjs';

export interface UserNameExistenceService
{
	doesUsernameExists(username: string, additionalParameters?: any): Observable<boolean>;
}

export interface EmailExistenceService
{
	doesEmailExists(email: string, additionalParameters?: any): Observable<boolean>;
}

export class UtilValidation
{
	public static validatorEmail(c: FormControl | AbstractControl): ValidationErrors | null
	{
		const regExp = /^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
		const pattern = new RegExp(regExp);
		
		return c.value === null || c.value?.length === 0 || pattern.test(c.value) ? null : {
			validEmail: false
		};
	}
	
	public static validatorPassword(c: FormControl | AbstractControl): ValidationErrors | null
	{
		const regExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!"§$%&/(){}|=?´'#*+^\\~;,:€@._-]{8,}$/;
		const pattern = new RegExp(regExp);
		
		return pattern.test(c.value) ? null : {
			validPassword: false
		};
	}
	
	public static validatorDate(c: FormControl | AbstractControl): ValidationErrors | null
	{
		const regExp = /^\d{4}[-]\d{2}[-]\d{2}$/;
		const pattern = new RegExp(regExp);
		
		return pattern.test(c.value) ? null : {
			validDate: false
		};
	}
	
	public static validatorTime(c: FormControl | AbstractControl): ValidationErrors | null
	{
		const regExp = /^\d{2}[:]\d{2}$/;
		const pattern = new RegExp(regExp);
		
		return pattern.test(c.value) ? null : {
			validTime: false
		};
	}
	
	public static validatorDateAtLeastXYearsOld(years: number = 16): ValidatorFn
	{
		return (control: AbstractControl): ValidationErrors | null => {
			const invalidObj: any = {validDateX: false};
			
			const regExp = /^\d{4}[./-]\d{2}[./-]\d{2}$/;
			const pattern = new RegExp(regExp);
			
			if (pattern.test(control.value))
			{
				const atLeastDate: Date = new Date();
				atLeastDate.setHours(0, 0, 0, 0);
				atLeastDate.setFullYear(atLeastDate.getFullYear() - years);
				
				const inputDate: Date = new Date(control.value);
				inputDate.setHours(0, 0, 0, 0);
				
				return inputDate.getTime() <= atLeastDate.getTime() ? null : invalidObj;
			}
			
			return invalidObj;
		}
	}
	
	public static asyncValidatorDoesUsernameExist(
		service: UserNameExistenceService,
		usernameSavedBefore: string = '',
		additionalParameters: any | null = null
	)
	{
		return function(control: AbstractControl) {
			return timer(500)
				.pipe(
					switchMap(() => {
							if (control.value === usernameSavedBefore)
							{
								return of(null);
							}
							
							return service.doesUsernameExists(control.value, additionalParameters).pipe(
								map(function(isUsernameExisting: boolean) {
									return !isUsernameExisting ? null : {uniqueUsername: false};
								})
							);
						}
					)
				);
		}
	}
	
	public static asyncValidatorDoesEmailExist(
		service: EmailExistenceService,
		emailSavedBefore: string = '',
		additionalParameters: any | null = null
	)
	{
		return function(control: AbstractControl) {
			return timer(500)
				.pipe(
					switchMap(() => {
							if (control.value === emailSavedBefore)
							{
								return of(null);
							}
							
							return service.doesEmailExists(control.value, additionalParameters).pipe(
								map(function(isEmailExisting: boolean) {
									return !isEmailExisting ? null : {uniqueEmail: false};
								})
							);
						}
					)
				);
		}
	}
	
}