import {NfcUserModel} from './nfc-user.model';
import {UtilObj} from '../../utils/util-obj';

export class NfcTeamModel
{
	constructor(
		public id: string,
		public userList: Array<NfcUserModel>
	)
	{
	}
	
	public static getListFromJSON(jsonList: Array<any>): Array<NfcTeamModel>
	{
		let list: Array<NfcTeamModel> = [];
		
		if (!jsonList)
		{
			return [];
		}
		
		for (const jsonObj of jsonList)
		{
			const model: NfcTeamModel | null = NfcTeamModel.getModelFromJSON(jsonObj);
			
			if (model)
			{
				list.push(model);
			}
		}
		
		//list = NfcTeamModel.sortList(list);
		
		return list;
	}
	
	/*public static sortList(list: Array<NfcTeamModel>): Array<NfcTeamModel>
	{
		return list.sort((a, b) => a.id - b.id);
	}*/
	
	public static getModelFromJSON(jsonObj: any): NfcTeamModel | null
	{
		if (!jsonObj)
		{
			return null;
		}
		
		const id: string | null = UtilObj.isset(jsonObj['teamID']) ? jsonObj['teamID'] : null;
		
		if (!id)
		{
			return null;
		}
		//const fileBasePath: string = 'uploads/shared-files/' + id + '/';
		
		const userList: Array<NfcUserModel> = UtilObj.isset(jsonObj['userList']) ?
			NfcUserModel.getListFromJSON(jsonObj['userList']) : [];
		
		return new NfcTeamModel(
			id,
			userList
		);
	}
}