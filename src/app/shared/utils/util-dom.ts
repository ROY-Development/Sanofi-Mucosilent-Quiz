export class UtilDom
{
	public static addElementClass(htmlElement: Element, className: string): void
	{
		htmlElement.classList.add(className);
	}
	
	public static removeElementClass(htmlElement: Element, className: string): void
	{
		htmlElement.classList.remove(className);
	}
	
	public static replaceElementClass(htmlElement: Element, searchValue: string, className: string): void
	{
		htmlElement.classList.forEach(
			(value: string) => {
				if (value.indexOf(searchValue) !== -1)
				{
					htmlElement.classList.remove(value);
				}
			}
		);
		
		htmlElement.classList.add(className);
	}
}