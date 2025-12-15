export class UtilObj
{
	/**
	 * Checks to see if a value is set.
	 *
	 * @param   {Function} accessor Function that returns our value
	 * @returns {Boolean}           Value is not undefined or null
	 */
	public static isset(accessor: any): boolean
	{
		try
		{
			return accessor !== undefined && accessor !== null;
		}
		catch (e)
		{
		}
		
		return false;
	}
	
	public static getStringFromObj(
		obj: any,
		deepCount: number,
		getKeys: boolean,
		excludeKeys: Array<string> | null = null
	): string
	{
		if (obj == null)
		{
			return String(obj);
		}
		switch (typeof obj)
		{
			case "string":
				return '"' + obj + '"';
			/*case "function":
				return obj.name || obj.toString();*/
			case "object":
				const indent = Array(deepCount || 1).join('\t'), isArray = Array.isArray(obj);
				return '{['[+isArray] + Object.keys(obj).map((key: string) => {
					
					if (excludeKeys && excludeKeys.indexOf(key) !== -1)
					{
						return '';
					}
					
					return '\n\t' + indent + (getKeys ? key + ': ' : '')
						+ UtilObj.getStringFromObj(obj[key], (deepCount || 1) + 1, getKeys, excludeKeys);
				}).join(',') + '\n' + indent + '}]'[+isArray];
			default:
				return obj.toString();
		}
	}
	
	public static getLength(obj: any): number
	{
		if (!UtilObj.isset(obj))
		{
			return 0;
		}
		
		let count: number = 0;
		for (const key in obj)
		{
			count++;
		}
		
		return count;
	}
}