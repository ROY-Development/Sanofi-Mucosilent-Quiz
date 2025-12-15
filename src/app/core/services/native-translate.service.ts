import {EventEmitter, Injectable, signal} from '@angular/core';
import {LocaleEnum} from '../../shared/enums/locale.enum';
import {AppConfig} from '../../app.config';

/*export interface TranslationChangeEvent
{
	locale: LocaleEnum;
}*/

@Injectable({
	providedIn: 'root'
})
export class NativeTranslateService
{
	public static TRANSLATION_FILE_PATH: string = '';
	
	public readonly signalCurrentLocale = signal<LocaleEnum>(AppConfig.defaultLocale);
	
	private _translations: any = {};
	private _currentLocale: LocaleEnum | null = null;
	private _currentAdditionalPaths: Array<string> | null = null;
	
	public readonly onTranslationChange = new EventEmitter<void>(); //EventEmitter<TranslationChangeEvent> = new EventEmitter<TranslationChangeEvent>();
	
	public get currentLocale(): LocaleEnum | null
	{
		return this._currentLocale;
	}
	
	public resetTranslations(): void
	{
		this._translations = {};
		
		if (NativeTranslateService.TRANSLATION_FILE_PATH.length > 0)
		{
			this.loadTranslation(LocaleEnum['en-main']).then(
				() => {
					this.onTranslationChange.emit();
				}
			);
		}
	}
	
	public areTranslationsAvailable(locale: LocaleEnum | null): boolean
	{
		return locale && this._translations[locale];
	}
	
	public async use(locale: LocaleEnum, additionalPaths: Array<string> | null = null): Promise<void>
	{
		if (
			this._currentLocale === locale &&
			this._currentAdditionalPaths === additionalPaths
		)
		{
			return;
		}
		
		this._currentLocale = locale;
		this.signalCurrentLocale.set(this._currentLocale);
		
		this._currentAdditionalPaths = additionalPaths;
		
		if (!this.areTranslationsAvailable(this._currentLocale))
		{
			await this.loadTranslation();
		}
		else
		{
			this.onTranslationChange.emit(); //{locale: this._currentLocale});
		}
	}
	
	public async loadTranslation(locale: LocaleEnum | null = null, additionalPaths: Array<string> | null = null, isForceLoading: boolean = false): Promise<void>
	{
		const useLocale: LocaleEnum | null = locale ?? this._currentLocale;
		const useAdditionalPaths: Array<string> | null = additionalPaths ?? this._currentAdditionalPaths;
		const translationFile: string = NativeTranslateService.TRANSLATION_FILE_PATH + useLocale + '.json';
		const translationFiles = [translationFile];
		
		if (useAdditionalPaths)
		{
			for (const value of useAdditionalPaths)
			{
				if (useLocale)
				{
					translationFiles.push(value.replace('{{locale}}', useLocale));
				}
			}
		}
		
		if (!isForceLoading && this.areTranslationsAvailable(useLocale))
		{
			return;
		}
		
		if (useLocale)
		{
			this._translations[useLocale] = {};
		}
		
		return await Promise.allSettled(
			translationFiles.map(file =>
				fetch(file)
					.then(response => response.json()).catch(
					(e: any) => {
						console.error(e);
					}
				)
			)
		).then(results => {
			const combinedTranslations = results
				.filter(result => result.status === "fulfilled")
				.map(result => result.value)
				.reduce((acc, curr) => Object.assign(acc, curr), {});
			
			if (useLocale)
			{
				this._translations[useLocale] = combinedTranslations;
			}
			
			this.onTranslationChange.emit();
		});
	}
	
	public overwriteLocalTranslationValue(locale: LocaleEnum, key: string, value: string): void
	{
		if (this._translations && this._translations[locale] && key in this._translations[locale])
		{
			this._translations[locale][key] = value;
			this.onTranslationChange.emit();
		}
	}
	
	public instant(key: string, parseParams: object | null = null, locale: LocaleEnum | null = null): string
	{
		const useLocale: LocaleEnum | null = locale ?? this._currentLocale;
		
		if (!useLocale || !this._translations[useLocale])
		{
			return key;
		}
		
		let translation: any;
		
		if (key.includes('.'))
		{
			const keys: Array<string> = key.split('.');
			translation = this._translations[useLocale][keys[0]]?.[keys[1]];
		}
		else
		{
			translation = this._translations[useLocale][key];
		}
		
		return translation ? this.getParsedResult(translation, parseParams) : key;
	}
	
	public getParsedResult(text: string, parseParams: any | null = null): string
	{
		if (!parseParams)
		{
			return text;
		}
		
		let value: string;
		for (const key in parseParams)
		{
			value = parseParams[key].toString();
			text = text.replaceAll('{{' + key + '}}', value);
		}
		
		return text;
	}
}