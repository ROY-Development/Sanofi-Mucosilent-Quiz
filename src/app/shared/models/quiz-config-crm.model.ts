export class QuizConfigCrmModel
{
	constructor(
		public isEnabled: boolean,
		public isFirstNameEnabled: boolean,
		public isLastNameEnabled: boolean,
		public isBirthdateEnabled: boolean,
		public isOrganisationEnabled: boolean,
		public isEmailEnabled: boolean,
		public isMessageEnabled: boolean,
		public typeCollectInformation: string | null,
		public urlCollectInformation: string | null
	)
	{
	}
	
	public static getModelFromJSON(jsonObj: any): QuizConfigCrmModel | null
	{
		if (!jsonObj)
		{
			return null;
		}
		
		return new QuizConfigCrmModel(
			jsonObj['isEnabled'] ?? false,
			jsonObj['isFirstNameEnabled'] ?? false,
			jsonObj['isLastNameEnabled'] ?? false,
			jsonObj['isBirthdateEnabled'] ?? false,
			jsonObj['isOrganisationEnabled'] ?? false,
			jsonObj['isEmailEnabled'] ?? false,
			jsonObj['isMessageEnabled'] ?? false,
			jsonObj['typeCollectInformation'] ?? null,
			jsonObj['urlCollectInformation'] ?? null
		);
	}
}