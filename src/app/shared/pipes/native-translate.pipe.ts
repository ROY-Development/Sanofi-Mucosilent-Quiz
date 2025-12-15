import {ChangeDetectorRef, inject, OnDestroy, Pipe, PipeTransform, SecurityContext} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {NativeTranslateService} from '../../core/services/native-translate.service';
import {Subscription} from 'rxjs';
import {UtilString} from '../utils/util-string';
import {LocaleEnum} from '../enums/locale.enum';

@Pipe({
	name: 'nativeTranslate',
	pure: false, // important for update
	standalone: false
})
export class NativeTranslatePipe implements PipeTransform, OnDestroy
{
	private nTranslateService = inject(NativeTranslateService);
	private changeDetectorRef = inject(ChangeDetectorRef);
	private domSanitizer = inject(DomSanitizer);
	
	public value: string = '';
	public lastKey: string | null = null;
	public lastLocale: string | null = null;
	public lastParseParams: object | null = null;
	
	public onTranslationChange: Subscription | null = null;
	
	public transform(key: string, parseParams: object | null = null, locale: LocaleEnum | null = null, useInnerHTML: boolean = false): string
	{
		const isDefinedLocale: boolean = !!locale;
		
		if (!locale)
		{
			locale = this.nTranslateService.currentLocale;
		}
		
		if (
			this.value !== this.lastKey &&
			this.lastKey === key &&
			this.lastLocale === locale &&
			this.areParseParamsEqual(this.lastParseParams, parseParams)
		)
		{
			return this.getCleanString(parseParams, useInnerHTML);
		}
		
		this.lastKey = key;
		this.lastLocale = locale;
		
		if (!this.onTranslationChange)
		{
			this.onTranslationChange = this.nTranslateService.onTranslationChange
				.subscribe(() => { //(event: TranslationChangeEvent) => {
					this.lastKey = null; // force translation update
					this.changeDetectorRef.detectChanges();
				});
		}
		
		if (isDefinedLocale && !this.nTranslateService.areTranslationsAvailable(locale))
		{
			this.lastLocale = null;
			this.nTranslateService.loadTranslation(locale).then();
		}
		else
		{
			this.value = this.nTranslateService.instant(key, parseParams, locale);
		}
		
		return this.getCleanString(parseParams, useInnerHTML);
	}
	
	public ngOnDestroy(): void
	{
		if (this.onTranslationChange)
		{
			this.onTranslationChange.unsubscribe();
			this.onTranslationChange = null;
		}
	}
	
	private areParseParamsEqual(params1: object | null, params2: object | null): boolean
	{
		if (params1 === params2)
		{
			return true;
		}
		
		if (!params1 || !params2)
		{
			return false;
		}
		
		const keys1 = Object.keys(params1);
		const keys2 = Object.keys(params2);
		
		if (keys1.length !== keys2.length)
		{
			return false;
		}
		
		return keys1.every(key => params1[key as keyof typeof params1] === params2[key as keyof typeof params2]);
	}
	
	private getCleanString(parseParams: any, useInnerHTML: boolean): string
	{
		if (useInnerHTML)
		{
			return this.domSanitizer.bypassSecurityTrustHtml(this.nTranslateService.getParsedResult(this.value, parseParams)) as string;
		}
		else
		{
			const value = this.domSanitizer.sanitize(SecurityContext.HTML, this.nTranslateService.getParsedResult(this.value, parseParams)) as string;
			return UtilString.decodeHtmlCharCodes(value);
		}
	}
}