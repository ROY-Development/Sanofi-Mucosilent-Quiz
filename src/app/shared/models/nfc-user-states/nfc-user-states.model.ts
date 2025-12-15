import {NfcTeamModel} from './nfc-team.model';
import {UtilObj} from '../../utils/util-obj';

export class NfcUserStatesModel
{
	constructor(
		public checkinActive: boolean,
		public teamList: Array<NfcTeamModel>,
		public teamLeft: NfcTeamModel,
		public teamRight: NfcTeamModel
	)
	{
	}
	
	public static getModelFromJSON(jsonObj: any): NfcUserStatesModel | null
	{
		if (!jsonObj)
		{
			return null;
		}
		
		//const fileBasePath: string = 'uploads/shared-files/' + id + '/';
		const teamList: Array<NfcTeamModel> = UtilObj.isset(jsonObj['teamList']) ? NfcTeamModel.getListFromJSON(jsonObj['teamList']) : [];
		
		let teamLeft: NfcTeamModel | null = null;
		let teamRight: NfcTeamModel | null = null;
		
		for (const team of teamList)
		{
			if (team.id === '1')
			{
				teamLeft = team;
			}
			else if (team.id === '2')
			{
				teamRight = team;
			}
		}
		
		if (!teamLeft)
		{
			teamLeft = NfcTeamModel.getModelFromJSON({id: '1'});
		}
		if (!teamRight)
		{
			teamRight = NfcTeamModel.getModelFromJSON({id: '2'});
		}
		
		return new NfcUserStatesModel(
			jsonObj['checkinActive'] ?? false,
			teamList,
			teamLeft!,
			teamRight!
		);
	}
}