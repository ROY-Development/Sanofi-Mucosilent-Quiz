export class UserCrmFormModel
{
	constructor(
		public firstName: string | null,
		public lastName: string | null,
		public birthdate: string | null,
		public organisation: string | null,
		public email: string | null,
		public message: string | null
	)
	{
	}
}