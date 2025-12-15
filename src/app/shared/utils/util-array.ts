export class UtilArray
{
	public static moveElement(list: Array<any>, element: any, offset: number): Array<any>
	{
		const index: number = list.indexOf(element);
		const newIndex = index + offset;
		
		if (newIndex > -1 && newIndex < list.length)
		{
			const removedElement = list.splice(index, 1)[0];
			list.splice(newIndex, 0, removedElement);
		}
		
		return list;
	}
	
	public static groupBy(list: Array<any>, property: string): Array<any>
	{
		const groupByMap: Map<any, any[]> = new Map(Array.from(list, obj => [obj[property], []]));
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		list.forEach(obj => groupByMap.get(obj[property]).push(obj));
		return Array.from(groupByMap.values());
	}
	
	public static sortBy(list: Array<any>, property: string, isAscending: boolean): Array<any>
	{
		return list.sort((a, b) => {
			const valueA = a[property];
			const valueB = b[property];
			
			if (valueA < valueB)
			{
				return isAscending ? -1 : 1;
			}
			else if (valueA > valueB)
			{
				return isAscending ? 1 : -1;
			}
			else
			{
				return 0;
			}
		});
	}
	
	/**
	 * Shuffles array in place. ES6 version
	 * @param {Array} list items An array containing the items.
	 */
	public static shuffleArray(list: Array<any>): Array<any>
	{
		for (let i = list.length - 1; i > 0; i--)
		{
			const j = Math.floor(Math.random() * (i + 1));
			[list[i], list[j]] = [list[j], list[i]];
		}
		return list;
	}
	
	public static areArraysEqual(list1: Array<any>, list2: Array<any>): boolean
	{
		if (list1.length !== list2.length)
		{
			return false;
		}
		
		const sortedList1 = list1.slice().sort();
		const sortedList2 = list2.slice().sort();
		
		return sortedList1.every(
			(value, index) => value === sortedList2[index]
		);
	}
	
	public static getCopy(list: Array<any>): Array<any>
	{
		const listCopy: Array<any> = [];
		
		for (let i = 0; i < listCopy.length; i++)
		{
			listCopy[i] = list[i];
		}
		
		return listCopy;
	}
	
	public static isIdInList(list: Array<any>, id: number): boolean
	{
		for (const item of list)
		{
			if (item.id === id)
			{
				return true;
			}
		}
		
		return false;
	}
	
	public static isValueInList(list: Array<any>, key: string, value: any): boolean
	{
		for (const item of list)
		{
			if (item[key] === value)
			{
				return true;
			}
		}
		
		return false;
	}
	
	public static removeElementById(list: Array<any>, id: number): Array<any>
	{
		let index: number = -1;
		for (let i = 0; i < list.length; i++)
		{
			if (list[i].id === id)
			{
				index = i;
				break;
			}
		}
		
		if (index !== -1)
		{
			list.splice(index, 1);
		}
		
		return list;
	}
	
	public static removeElementByValue(list: Array<any>, key: string, value: any): Array<any>
	{
		let index: number = -1;
		for (let i = 0; i < list.length; i++)
		{
			if (list[i][key] === value)
			{
				index = i;
				break;
			}
		}
		
		if (index !== -1)
		{
			list.splice(index, 1);
		}
		
		return list;
	}
	
	public static hasEqualEntries(listA: Array<any>, listB: Array<any>): boolean
	{
		return listA.length === listB.length && listA.every((value, index) => value === listB[index]);
	}
}