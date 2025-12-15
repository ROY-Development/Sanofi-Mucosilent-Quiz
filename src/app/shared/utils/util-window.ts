export class UtilWindow
{
	public static getPageYOffset(): number
	{
		return window.scrollY; // window.pageYOffset is obsolete
	}
}