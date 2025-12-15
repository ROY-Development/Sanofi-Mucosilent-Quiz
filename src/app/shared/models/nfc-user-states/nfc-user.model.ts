import {UtilObj} from '../../utils/util-obj';
import {LocaleEnum} from '../../enums/locale.enum';
import {AppConfig} from '../../../app.config';

export class NfcUserModel
{
	constructor(
		public id: string,
		public firstname: string,
		public lastname: string,
		public locale: LocaleEnum,
		public market: string,
		public jobRole: string,
		public group: number,
		public wave: number
	)
	{
	}
	
	public flagCountry: string = 'gb';
	
	public get fullname(): string
	{
		return this.firstname + ' ' + this.lastname;
	}
	
	public static getListFromJSON(jsonList: Array<any>): Array<NfcUserModel>
	{
		let list: Array<NfcUserModel> = [];
		
		if (!jsonList)
		{
			return [];
		}
		
		for (const jsonObj of jsonList)
		{
			const model: NfcUserModel | null = NfcUserModel.getModelFromJSON(jsonObj);
			
			if (model)
			{
				list.push(model);
			}
		}
		
		// list = NfcUserModel.sortList(list);
		
		return list;
	}
	
	/*public static sortList(list: Array<NfcUserModel>): Array<NfcUserModel>
	{
		return list.sort((a, b) => a.id - b.id);
	}*/
	
	public static getModelFromJSON(jsonObj: any): NfcUserModel | null
	{
		if (!jsonObj)
		{
			return null;
		}
		
		const id: string = UtilObj.isset(jsonObj['userID']) ? jsonObj['userID'] : '';
		
		if (id === '')
		{
			return null;
		}
		//const fileBasePath: string = 'uploads/shared-files/' + id + '/';
		let locale: LocaleEnum = UtilObj.isset(jsonObj['language']) ? (<any>LocaleEnum)[jsonObj['language'].replace('_', '-')] : AppConfig.defaultLocale;
		
		if (!locale)
		{
			locale = AppConfig.defaultLocale;
		}
		
		const nfcUserModel = new NfcUserModel(
			id,
			jsonObj['firstname'] || '',
			jsonObj['lastname'] || '',
			locale,
			jsonObj['market'] || '',
			jsonObj['jobrole'] || '',
			UtilObj.isset(jsonObj['group']) ? parseInt(jsonObj['group'], 10) : -1,
			UtilObj.isset(jsonObj['wave']) ? parseInt(jsonObj['wave'], 10) : -1
		);
		
		nfcUserModel.flagCountry = nfcUserModel.locale.split('-')[1].toLowerCase();
		
		return nfcUserModel;
	}
}